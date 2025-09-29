import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

// Rate limiting map: key = user_identifier, value = { count, resetTime }
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX_ATTEMPTS = 3;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

function checkRateLimit(identifier: string): { allowed: boolean; resetIn?: number } {
  const now = Date.now();
  const record = rateLimitMap.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }
  
  if (record.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    const resetIn = Math.ceil((record.resetTime - now) / 1000 / 60); // minutes
    return { allowed: false, resetIn };
  }
  
  // Increment count
  record.count++;
  rateLimitMap.set(identifier, record);
  return { allowed: true };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Request body:', JSON.stringify(body, null, 2));

    // Support both new and old request formats
    let user_identifier: string | undefined;
    let type: string;
    let action: string | undefined;

    // New format
    const { identifier, type: requestType, action: requestAction } = body;
    
    // Old format
    const { phone, email, verification_type } = body;

    // Determine user_identifier and type
    if (identifier) {
      user_identifier = identifier;
      
      // Validate and map request type
      if (!requestType || !['sms', 'email'].includes(requestType)) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid type. Must be "sms" or "email"' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Map request type to verification type (must be 'sms' or 'email' per DB constraint)
      type = requestType;
      action = requestAction;
    } else {
      // Old format - determine identifier and type
      if (phone) {
        user_identifier = phone;
        type = 'sms';
      } else if (email) {
        user_identifier = email;
        type = 'email';
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Either phone or email is required' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      action = body.action;
    }

    console.log('Detected identifier:', user_identifier, 'type:', type);

    if (!user_identifier) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User identifier is required' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check rate limiting
    const rateLimit = checkRateLimit(user_identifier);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Too many verification attempts. Please try again in ${rateLimit.resetIn} minutes.` 
        }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate a random 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the code for secure storage
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Store the verification code
    const { error: dbError } = await supabase
      .from('verification_codes')
      .insert({
        user_identifier,
        code_hash: codeHash,
        verification_type: type,
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
        status: 'pending'
      });

    if (dbError) {
      console.error("Error storing verification code:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to create verification code' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    let sendingResult: { success: boolean; message?: string; error?: string };
    
    if (type === 'sms') {
      sendingResult = await sendSMSVerification(user_identifier, code, type);
    } else if (type === 'email') {
      sendingResult = await sendEmailVerification(user_identifier, code, type);
    } else {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid verification type. Must be "sms" or "email"' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: sendingResult.success,
        message: sendingResult.message,
        error: sendingResult.error
      }),
      { 
        status: sendingResult.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-verification:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Helper functions
function isPhoneNumber(identifier: string): boolean {
  return /^\+?1?\d{10}$/.test(identifier.replace(/[\s()-]/g, ''));
}

function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith('1')) {
    return `+${cleaned}`;
  }
  return phone;
}

async function sendSMSVerification(phone: string, code: string, type: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !twilioPhone) {
      console.error("Missing Twilio credentials");
      return {
        success: false,
        error: "SMS service not configured"
      };
    }

    const formattedPhone = formatPhoneNumber(phone);
    console.log(`Sending SMS to: ${formattedPhone}`);

    const messageBody = `Your MFA verification code is: ${code}. This code expires in 10 minutes. Do not share this code with anyone.`;

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: formattedPhone,
          From: twilioPhone,
          Body: messageBody,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Twilio error:", errorData);
      return {
        success: false,
        error: "Failed to send SMS"
      };
    }

    console.log("SMS sent successfully");
    return {
      success: true,
      message: "Verification code sent via SMS"
    };

  } catch (error) {
    console.error("SMS error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send SMS"
    };
  }
}

async function sendEmailVerification(email: string, code: string, type: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.error("Missing Resend API key");
      return {
        success: false,
        error: "Email service not configured"
      };
    }

    console.log(`Sending verification email to: ${email}`);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MuniNow <onboarding@resend.dev>",
        to: [email],
        subject: "Your MFA Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Verification Code</h2>
            <p>Your MFA verification code is:</p>
            <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
              ${code}
            </div>
            <p style="color: #666;">This code will expire in 10 minutes.</p>
            <p style="color: #999; font-size: 12px; margin-top: 30px;">
              If you didn't request this code, please ignore this email. Do not share this code with anyone.
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Resend error:", errorData);
      return {
        success: false,
        error: "Failed to send email"
      };
    }

    console.log("Email sent successfully");
    return {
      success: true,
      message: "Verification code sent via email"
    };

  } catch (error) {
    console.error("Email error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to send email"
    };
  }
}
