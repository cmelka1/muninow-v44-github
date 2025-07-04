import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerificationRequest {
  identifier: string; // email or phone number
  type: 'email' | 'sms';
  action?: 'send' | 'verify';
  code?: string;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
);

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

// Helper functions for hashing using Deno's crypto API
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function compareCode(inputCode: string, hashedCode: string): Promise<boolean> {
  const inputHash = await hashCode(inputCode);
  return inputHash === hashedCode;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate environment variables
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY'];
  for (const envVar of requiredEnvVars) {
    if (!Deno.env.get(envVar)) {
      console.error(`Missing required environment variable: ${envVar}`);
      return new Response(
        JSON.stringify({ error: `Server configuration error: Missing ${envVar}`, success: false }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }
  }

  try {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    const { identifier, type, action = 'send', code }: VerificationRequest = await req.json();
    console.log(`Processing ${action} request for ${type}: ${identifier}`);

    if (action === 'send') {
      return await sendVerificationCode(identifier, type);
    } else if (action === 'verify') {
      return await verifyCode(identifier, type, code!);
    } else {
      throw new Error('Invalid action');
    }
  } catch (error: any) {
    console.error("Error in send-verification function:", error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

async function sendVerificationCode(identifier: string, type: 'email' | 'sms'): Promise<Response> {
  // Normalize the identifier for consistent storage
  let normalizedIdentifier = identifier;
  if (type === 'sms') {
    normalizedIdentifier = normalizePhoneNumber(identifier);
    console.log(`Normalized phone number from ${identifier} to ${normalizedIdentifier}`);
  }
  
  // Clean up old pending codes for this identifier/type before creating new one
  await supabase
    .from('verification_codes')
    .update({ status: 'expired' })
    .eq('user_identifier', normalizedIdentifier)
    .eq('verification_type', type)
    .eq('status', 'pending');

  // Check rate limiting - max 3 attempts per 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  
  const { data: recentCodes, error: checkError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('user_identifier', normalizedIdentifier)
    .eq('verification_type', type)
    .gte('created_at', tenMinutesAgo);

  if (checkError) {
    throw new Error(`Error checking rate limit: ${checkError.message}`);
  }

  if (recentCodes && recentCodes.length >= 3) {
    return new Response(
      JSON.stringify({ 
        error: "Too many verification attempts. Please wait 10 minutes before trying again.",
        success: false 
      }),
      {
        status: 429,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Generate 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  console.log(`Generating verification code for ${type}: ${normalizedIdentifier}, code: ${code}`);
  const codeHash = await hashCode(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // Extended to 10 minutes

  // Store verification code
  const { error: insertError } = await supabase
    .from('verification_codes')
    .insert({
      user_identifier: normalizedIdentifier,
      code_hash: codeHash,
      verification_type: type,
      expires_at: expiresAt,
      status: 'pending'
    });

  if (insertError) {
    throw new Error(`Error storing verification code: ${insertError.message}`);
  }

  // Send code based on type
  try {
    if (type === 'email') {
      await sendEmailCode(identifier, code);
    } else if (type === 'sms') {
      await sendSMSCode(identifier, code);
    }

    return new Response(
      JSON.stringify({ 
        message: `Verification code sent via ${type}`,
        success: true 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (sendError: any) {
    console.error(`Error sending ${type} code:`, sendError);
    
    // Clean up the stored code if sending failed
    await supabase
      .from('verification_codes')
      .update({ status: 'expired' })
      .eq('user_identifier', identifier)
      .eq('verification_type', type)
      .eq('status', 'pending');

    throw new Error(`Failed to send verification code: ${sendError.message}`);
  }
}

async function sendEmailCode(email: string, code: string): Promise<void> {
  const emailResponse = await resend.emails.send({
    from: "MuniPay <verification@resend.dev>",
    to: [email],
    subject: "Your MuniPay Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #333; margin-bottom: 10px;">MuniPay Verification</h1>
          <p style="color: #666; font-size: 16px;">Complete your account setup</p>
        </div>
        
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 30px; text-align: center; margin-bottom: 30px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Verification Code</h2>
          <div style="font-size: 32px; font-weight: bold; color: #2563eb; letter-spacing: 8px; margin: 20px 0; font-family: 'Courier New', monospace;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">
            This code will expire in 5 minutes
          </p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <p style="color: #333; font-size: 16px; margin-bottom: 10px;">
            Enter this code to verify your email address and complete your MuniPay account setup.
          </p>
          <p style="color: #666; font-size: 14px;">
            If you didn't request this code, you can safely ignore this email.
          </p>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <div style="text-align: center;">
          <p style="color: #999; font-size: 12px;">
            This is an automated message from MuniPay. Please do not reply to this email.
          </p>
        </div>
      </div>
    `,
  });

  if (emailResponse.error) {
    throw new Error(`Email sending failed: ${emailResponse.error.message}`);
  }
}

// Helper function to normalize phone numbers consistently
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let cleanPhone = phone.replace(/\D/g, '');
  
  // Handle US phone numbers: remove leading 1 if present
  if (cleanPhone.startsWith('1') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(1);
  }
  
  // Validate we have exactly 10 digits for US phone numbers
  if (cleanPhone.length !== 10) {
    throw new Error(`Invalid US phone number format. Expected 10 digits, got ${cleanPhone.length}: ${cleanPhone}`);
  }
  
  // Return E.164 format for US numbers
  return `+1${cleanPhone}`;
}

async function sendSMSCode(phone: string, code: string): Promise<void> {
  console.log(`Original phone number received: ${phone}`);
  
  // Normalize phone number (already in E.164 format)
  const normalizedPhone = normalizePhoneNumber(phone);
  console.log(`Phone after normalization: ${normalizedPhone}`);
  
  // Use the normalized phone directly since it's already in E.164 format
  const formattedPhone = normalizedPhone;
  console.log(`Phone formatted for Twilio: ${formattedPhone}`);

  const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const twilioNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+18449463299';
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }

  console.log(`Using Twilio sender number: ${twilioNumber}`);
  const message = `Your MuniPay verification code is: ${code}. This code expires in 5 minutes.`;

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        From: twilioNumber,
        To: formattedPhone,
        Body: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error(`Twilio API error response: ${errorData}`);
      
      // Parse Twilio error for better user feedback
      try {
        const errorJson = JSON.parse(errorData);
        const twilioError = errorJson.message || errorData;
        throw new Error(`SMS sending failed: ${twilioError}`);
      } catch {
        throw new Error(`SMS sending failed: ${errorData}`);
      }
    }

    console.log(`SMS sent successfully to ${formattedPhone}`);
  } catch (error) {
    console.error(`Error sending SMS to ${formattedPhone}:`, error);
    throw error;
  }
}

async function verifyCode(identifier: string, type: 'email' | 'sms', inputCode: string): Promise<Response> {
  if (!inputCode || inputCode.length !== 6) {
    return new Response(
      JSON.stringify({ 
        error: "Please enter a valid 6-digit code",
        success: false 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  // Normalize the identifier for consistent lookup
  let normalizedIdentifier = identifier;
  if (type === 'sms') {
    normalizedIdentifier = normalizePhoneNumber(identifier);
    console.log(`Verifying code for normalized phone number: ${normalizedIdentifier} (original: ${identifier})`);
  }

  console.log(`Looking up verification code for ${type}: ${normalizedIdentifier}`);

  // Get the most recent pending code for this identifier and type
  const { data: codes, error: fetchError } = await supabase
    .from('verification_codes')
    .select('*')
    .eq('user_identifier', normalizedIdentifier)
    .eq('verification_type', type)
    .eq('status', 'pending')
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  console.log(`Database lookup result: found ${codes?.length || 0} codes`);

  if (fetchError) {
    console.error(`Database fetch error: ${fetchError.message}`);
    throw new Error(`Error fetching verification code: ${fetchError.message}`);
  }

  if (!codes || codes.length === 0) {
    console.log(`No valid codes found for ${normalizedIdentifier} of type ${type}`);
    return new Response(
      JSON.stringify({ 
        error: "No valid verification code found. Please request a new code.",
        success: false 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }

  const storedCode = codes[0];
  console.log(`Found stored code with hash: ${storedCode.code_hash}, created: ${storedCode.created_at}, expires: ${storedCode.expires_at}`);

  // Increment attempt count
  const newAttemptCount = storedCode.attempt_count + 1;
  console.log(`Comparing input code ${inputCode} against stored hash ${storedCode.code_hash}`);
  
  // Check if code is correct
  const isValidCode = await compareCode(inputCode, storedCode.code_hash);
  console.log(`Code comparison result: ${isValidCode}`);

  if (isValidCode) {
    // Mark code as verified
    const { error: updateError } = await supabase
      .from('verification_codes')
      .update({ 
        status: 'verified',
        attempt_count: newAttemptCount
      })
      .eq('id', storedCode.id);

    if (updateError) {
      throw new Error(`Error updating verification code: ${updateError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        message: "Code verified successfully",
        success: true 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } else {
    // Update attempt count
    await supabase
      .from('verification_codes')
      .update({ attempt_count: newAttemptCount })
      .eq('id', storedCode.id);

    // If too many attempts, expire the code
    if (newAttemptCount >= 3) {
      await supabase
        .from('verification_codes')
        .update({ status: 'expired' })
        .eq('id', storedCode.id);

      return new Response(
        JSON.stringify({ 
          error: "Too many incorrect attempts. Please request a new code.",
          success: false 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        error: `Incorrect code. ${3 - newAttemptCount} attempts remaining.`,
        success: false 
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
}

serve(handler);