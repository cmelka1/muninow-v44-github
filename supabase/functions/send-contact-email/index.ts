import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// import { Resend } from "npm:resend@2.0.0";

// const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const AUTHORIZED_EMAIL = "cmelka@muninow.com"; // Your verified email address

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  organization: string;
  message: string;
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData: ContactFormData = await req.json();
    
    // Validate required fields
    if (!formData.firstName || !formData.lastName || !formData.email) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Processing contact form from ${formData.email}`);
    
    // Contact form submission disabled (resend package issues)
    console.log("Contact form submitted but email sending disabled");
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        id: "email-disabled",
        note: "Message received. Email functionality temporarily disabled."
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});