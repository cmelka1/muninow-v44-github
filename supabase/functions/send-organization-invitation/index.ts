import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.3";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};

const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

interface InvitationRequest {
  invitation_id: string;
  invitation_email: string;
  admin_name: string;
  organization_type: 'resident' | 'business' | 'municipal';
  role: 'admin' | 'user';
  invitation_token: string;
}

const handler = async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Validate environment variables
  const requiredEnvVars = ['SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'RESEND_API_KEY'];
  for (const envVar of requiredEnvVars) {
    if (!Deno.env.get(envVar)) {
      return new Response(JSON.stringify({
        error: `Server configuration error: Missing ${envVar}`,
        success: false
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }
  }

  try {
    const { 
      invitation_id, 
      invitation_email, 
      admin_name, 
      organization_type, 
      role, 
      invitation_token 
    }: InvitationRequest = await req.json();

    console.log(`Sending organization invitation to ${invitation_email} from ${admin_name}`);

    // Generate invitation URL
    const invitationUrl = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovable.app').replace('https://qcuiuubbaoezcmejzvxje', 'https://your-project')}/signup?invitation=${invitation_token}`;

    // Get organization labels
    const getOrganizationLabels = (type: string) => {
      switch (type) {
        case 'business': return { org: 'team', member: 'team member' };
        case 'municipal': return { org: 'organization', member: 'organization member' };
        default: return { org: 'household', member: 'household member' };
      }
    };

    const labels = getOrganizationLabels(organization_type);
    const roleLabel = role === 'admin' ? 'Administrator' : 'Member';

    // Send invitation email
    const emailResponse = await resend.emails.send({
      from: "MuniNow <invitations@resend.dev>",
      to: [invitation_email],
      subject: `You're invited to join ${admin_name}'s ${labels.org} on MuniNow`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 40px; padding: 30px 0; background: linear-gradient(135deg, hsl(221, 83%, 97%) 0%, hsl(250, 84%, 96%) 100%); border-radius: 12px;">
            <h1 style="color: hsl(221, 83%, 45%); margin: 0; font-size: 28px; font-weight: 700; margin-bottom: 8px;">
              MuniNow
            </h1>
            <p style="color: hsl(215, 16%, 47%); margin: 0; font-size: 16px;">
              Municipal Bill Payment Platform
            </p>
          </div>
          
          <!-- Main Content -->
          <div style="margin-bottom: 40px;">
            <h2 style="color: hsl(222, 84%, 5%); font-size: 24px; font-weight: 600; margin: 0 0 20px 0; line-height: 1.3;">
              You've been invited to join ${admin_name}'s ${labels.org}
            </h2>
            
            <p style="color: hsl(215, 16%, 47%); font-size: 16px; line-height: 1.6; margin: 0 0 24px 0;">
              <strong>${admin_name}</strong> has invited you to join their ${labels.org} on MuniNow as a <strong>${roleLabel}</strong>. 
              As a ${labels.member}, you'll be able to manage municipal bills and payments together.
            </p>
            
            <!-- Invitation Details -->
            <div style="background-color: hsl(210, 40%, 96%); border-radius: 8px; padding: 24px; margin: 24px 0; border-left: 4px solid hsl(221, 83%, 45%);">
              <h3 style="color: hsl(222, 84%, 5%); font-size: 18px; font-weight: 600; margin: 0 0 12px 0;">
                Invitation Details
              </h3>
              <div style="color: hsl(215, 16%, 47%); font-size: 14px; line-height: 1.5;">
                <p style="margin: 0 0 8px 0;"><strong>Organization Type:</strong> ${labels.org.charAt(0).toUpperCase() + labels.org.slice(1)}</p>
                <p style="margin: 0 0 8px 0;"><strong>Your Role:</strong> ${roleLabel}</p>
                <p style="margin: 0;"><strong>Invited by:</strong> ${admin_name}</p>
              </div>
            </div>
          </div>
          
          <!-- Call to Action -->
          <div style="text-align: center; margin: 40px 0;">
            <a href="${invitationUrl}" 
               style="display: inline-block; background: linear-gradient(135deg, hsl(221, 83%, 45%) 0%, hsl(250, 84%, 46%) 100%); 
                      color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; 
                      font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(20, 66, 178, 0.3);
                      transition: all 0.3s ease;">
              Accept Invitation & Join ${labels.org.charAt(0).toUpperCase() + labels.org.slice(1)}
            </a>
          </div>
          
          <!-- Alternative Instructions -->
          <div style="background-color: hsl(250, 84%, 98%); border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: hsl(215, 16%, 47%); font-size: 14px; line-height: 1.5; margin: 0 0 12px 0;">
              <strong>Can't click the button?</strong> Copy and paste this link into your browser:
            </p>
            <p style="color: hsl(221, 83%, 45%); font-size: 14px; word-break: break-all; margin: 0; font-family: 'Courier New', monospace; background-color: white; padding: 8px; border-radius: 4px; border: 1px solid hsl(214, 32%, 91%);">
              ${invitationUrl}
            </p>
          </div>
          
          <!-- Benefits -->
          <div style="margin: 32px 0;">
            <h3 style="color: hsl(222, 84%, 5%); font-size: 18px; font-weight: 600; margin: 0 0 16px 0;">
              What you can do as a ${labels.member}:
            </h3>
            <ul style="color: hsl(215, 16%, 47%); font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
              <li style="margin-bottom: 8px;">View and pay municipal bills for your ${labels.org}</li>
              <li style="margin-bottom: 8px;">Share payment methods within your ${labels.org}</li>
              <li style="margin-bottom: 8px;">Access bill history and payment records</li>
              <li style="margin-bottom: 8px;">Receive notifications for new bills and due dates</li>
              ${role === 'admin' ? `<li style="margin-bottom: 8px;"><strong>Manage ${labels.org} members and their permissions</strong></li>` : ''}
            </ul>
          </div>
          
          <!-- Footer -->
          <hr style="border: none; border-top: 1px solid hsl(214, 32%, 91%); margin: 40px 0;">
          
          <div style="text-align: center;">
            <p style="color: hsl(215, 16%, 47%); font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;">
              This invitation will expire in 7 days. If you didn't expect this invitation, you can safely ignore this email.
            </p>
            <p style="color: hsl(215, 16%, 47%); font-size: 12px; margin: 0;">
              Need help? Contact us at support@muninow.com
            </p>
          </div>
        </div>
      `
    });

    if (emailResponse.error) {
      console.error("Email sending failed:", emailResponse.error);
      throw new Error(`Email sending failed: ${emailResponse.error.message}`);
    }

    console.log("Organization invitation email sent successfully:", emailResponse.data?.id);

    // Update invitation record with email sent status
    const { error: updateError } = await supabase
      .from('organization_invitations')
      .update({
        email_sent_at: new Date().toISOString(),
        email_status: 'sent'
      })
      .eq('id', invitation_id);

    if (updateError) {
      console.error("Failed to update invitation status:", updateError);
      // Don't fail the request since email was sent successfully
    }

    return new Response(JSON.stringify({
      message: "Organization invitation sent successfully",
      success: true,
      email_id: emailResponse.data?.id
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (error) {
    console.error("Error in send-organization-invitation function:", error);
    return new Response(JSON.stringify({
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
};

serve(handler);