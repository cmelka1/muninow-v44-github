import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
// import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, email, type } = await req.json();

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

    if (!type || !['signup', 'login', 'password_reset'].includes(type)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Invalid verification type' 
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

    // Store verification code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        phone,
        email,
        code,
        type,
        expires_at: expiresAt.toISOString(),
        status: 'pending'
      });

    if (insertError) {
      console.error("Error storing verification code:", insertError);
      const errorMessage = insertError instanceof Error ? insertError.message : 'Database error';
      return new Response(
        JSON.stringify({ success: false, error: errorMessage }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verification sending disabled (resend package issues)
    console.log("Verification code created but sending disabled");

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Verification code created. Sending functionality temporarily disabled.',
        code: code // For testing only - remove in production
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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