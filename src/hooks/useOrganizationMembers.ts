import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface OrganizationMember {
  id: string;
  member_id: string;
  role: 'admin' | 'user';
  organization_type: 'resident' | 'business' | 'municipal';
  joined_at: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
}

export const useOrganizationMembers = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadMembers = async () => {
    if (!user) {
      setMembers([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      
      const { data, error } = await supabase.rpc('get_organization_members', {
        user_id: user.id
      });

      if (error) {
        console.error('Error loading organization members:', error);
        toast({
          title: "Error",
          description: "Failed to load organization members. Please try again.",
          variant: "destructive",
        });
        return;
      }

      setMembers((data || []) as OrganizationMember[]);
    } catch (error) {
      console.error('Error loading organization members:', error);
      toast({
        title: "Error",
        description: "Failed to load organization members. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'user', organizationType: 'resident' | 'business' | 'municipal') => {
    try {
      // Step 1: Create invitation in database
      const { data: invitationId, error } = await supabase.rpc('create_organization_invitation', {
        p_invitation_email: email,
        p_role: role,
        p_organization_type: organizationType
      });

      if (error) {
        console.error('Error creating invitation:', error);
        toast({
          title: "Error",
          description: "Failed to create invitation. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Step 2: Get invitation details for email
      const { data: invitation, error: fetchError } = await supabase
        .from('organization_invitations')
        .select('id, invitation_token, invitation_email, role, organization_type')
        .eq('id', invitationId)
        .single();

      if (fetchError || !invitation) {
        console.error('Error fetching invitation details:', fetchError);
        toast({
          title: "Error",
          description: "Failed to retrieve invitation details. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Step 3: Get admin profile for email context
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user?.id)
        .single();

      if (profileError || !profile) {
        console.error('Error fetching admin profile:', profileError);
        toast({
          title: "Error",
          description: "Failed to load profile information. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      // Step 4: Send invitation email
      const { data: emailResult, error: emailError } = await supabase.functions.invoke('send-organization-invitation', {
        body: {
          invitation_id: invitation.id,
          invitation_email: invitation.invitation_email,
          admin_name: `${profile.first_name} ${profile.last_name}`,
          organization_type: invitation.organization_type,
          role: invitation.role,
          invitation_token: invitation.invitation_token
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        toast({
          title: "Invitation Created",
          description: "Invitation was created but email sending failed. Please contact the user directly.",
          variant: "destructive",
        });
        return true; // Still consider success since invitation exists
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully via email.",
      });

      return true;
    } catch (error) {
      console.error('Error in invite flow:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organization_memberships')
        .update({ status: 'inactive' })
        .eq('member_id', memberId)
        .eq('organization_admin_id', user?.id);

      if (error) {
        console.error('Error removing member:', error);
        toast({
          title: "Error",
          description: "Failed to remove member. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Member removed successfully.",
      });

      // Reload members
      await loadMembers();
      return true;
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove member. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'user') => {
    try {
      const { error } = await supabase
        .from('organization_memberships')
        .update({ role: newRole })
        .eq('member_id', memberId)
        .eq('organization_admin_id', user?.id);

      if (error) {
        console.error('Error updating member role:', error);
        toast({
          title: "Error",
          description: "Failed to update member role. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Member role updated successfully.",
      });

      // Reload members
      await loadMembers();
      return true;
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: "Error",
        description: "Failed to update member role. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    loadMembers();
  }, [user]);

  return {
    members,
    isLoading,
    loadMembers,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
};