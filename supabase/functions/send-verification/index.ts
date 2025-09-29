import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");

// Helper function to determine if a string is a phone number
function isPhoneNumber(identifier: string): boolean {
  // Remove all non-digit characters and check if it's a valid phone format
  const digitsOnly = identifier.replace(/\D/g, '');
  return digitsOnly.length >= 10 && digitsOnly.length <= 15;
}

// Helper function to format phone number to E.164 format
function formatPhoneNumber(phone: string): string {
  const digitsOnly = phone.replace(/\D/g, '');
  // Assume US numbers if 10 digits, add country code
  if (digitsOnly.length === 10) {
    return '+1' + digitsOnly;
  }
  // Add + if not present
  return digitsOnly.startsWith('1') ? '+' + digitsOnly : '+1' + digitsOnly;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Request body:', requestBody);

    // Handle both old format {phone, email, type} and new MFA format {identifier, type, action}
    let phone = null;
    let email = null;
    let type = null;

    if (requestBody.identifier) {
      // New MFA format
      const { identifier, type: requestType, action } = requestBody;
      
      if (!identifier) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Identifier is required' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Determine if identifier is phone or email
      if (isPhoneNumber(identifier)) {
        phone = formatPhoneNumber(identifier);
        console.log('Detected phone number:', phone);
      } else if (identifier.includes('@')) {
        email = identifier.toLowerCase().trim();
        console.log('Detected email:', email);
      } else {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Invalid identifier format' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      // Map MFA type to verification type
      if (requestType === 'sms' && phone) {
        type = 'mfa';
      } else if (requestType === 'email' && email) {
        type = 'mfa';
      } else {
        type = action || 'mfa'; // Use action if available, default to mfa
      }
    } else {
      // Old format
      phone = requestBody.phone;
      email = requestBody.email;
      type = requestBody.type;
    }

    if (!phone && !email) {
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

    if (!type || !['signup', 'login', 'password_reset', 'mfa'].includes(type)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid verification type. Must be one of: signup, login, password_reset, mfa' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Hash the code for secure storage
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const codeHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    // Determine user_identifier from phone or email
    const userIdentifier = phone || email;

    // Store verification code with new schema
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        user_identifier: userIdentifier,
        code_hash: codeHash,
        verification_type: type,
        expires_at: expiresAt.toISOString(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error("Error storing verification code:", insertError);
      const errorMessage = insertError instanceof Error ? insertError.message : 'Database error';
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Send verification based on method
    let sendingResult: { success: boolean; message: string; error: string | null } = { success: false, message: '', error: null };
    
    if (phone) {
      sendingResult = await sendSMSVerification(phone, code, type);
    } else if (email) {
      sendingResult = await sendEmailVerification(email, code, type);
    }

    return new Response(
      JSON.stringify({ 
        success: sendingResult.success,
        message: sendingResult.message,
        error: sendingResult.error,
        code: code // For testing only - remove in production
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

// SMS sending function using Twilio
async function sendSMSVerification(phone: string, code: string, type: string) {
  try {
    const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER') || '+18333691461';

    if (!twilioAccountSid || !twilioAuthToken) {
      console.error('Twilio credentials not configured');
      return {
        success: false,
        message: 'SMS service not configured',
        error: 'Twilio credentials missing'
      };
    }

    // Format verification message based on type
    let message = '';
    switch (type) {
      case 'mfa':
        message = `Your MuniNow verification code is: ${code}. This code expires in 15 minutes.`;
        break;
      case 'signup':
        message = `Welcome to MuniNow! Your verification code is: ${code}. This code expires in 15 minutes.`;
        break;
      case 'login':
        message = `Your MuniNow login verification code is: ${code}. This code expires in 15 minutes.`;
        break;
      case 'password_reset':
        message = `Your MuniNow password reset code is: ${code}. This code expires in 15 minutes.`;
        break;
      default:
        message = `Your MuniNow verification code is: ${code}. This code expires in 15 minutes.`;
    }

    console.log(`Sending SMS to ${phone} with message: ${message}`);

    const twilioResponse = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: twilioPhoneNumber,
          To: phone,
          Body: message,
        }),
      }
    );

    if (twilioResponse.ok) {
      const result = await twilioResponse.json();
      console.log('SMS sent successfully:', result.sid);
      return {
        success: true,
        message: 'Verification code sent via SMS',
        error: null
      };
    } else {
      const errorText = await twilioResponse.text();
      console.error('Twilio SMS error:', errorText);
      return {
        success: false,
        message: 'Failed to send SMS',
        error: `Twilio error: ${errorText}`
      };
    }
  } catch (error) {
    console.error('SMS sending error:', error);
    return {
      success: false,
      message: 'SMS sending failed',
      error: error instanceof Error ? error.message : 'Unknown SMS error'
    };
  }
}

// Email sending function (disabled for now due to Resend package issues)
async function sendEmailVerification(email: string, code: string, type: string) {
  console.log(`Email verification requested for ${email} with code ${code} (type: ${type})`);
  console.log('Email sending is currently disabled due to Resend package issues');
  
  return {
    success: false,
    message: 'Email verification is temporarily disabled',
    error: 'Email sending functionality is temporarily disabled due to package issues'
  };
}