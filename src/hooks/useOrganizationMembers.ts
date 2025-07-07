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
      const { data, error } = await supabase.rpc('create_organization_invitation', {
        p_invitation_email: email,
        p_role: role,
        p_organization_type: organizationType
      });

      if (error) {
        console.error('Error creating invitation:', error);
        toast({
          title: "Error",
          description: "Failed to send invitation. Please try again.",
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Success",
        description: "Invitation sent successfully.",
      });

      return true;
    } catch (error) {
      console.error('Error creating invitation:', error);
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