import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface UseUserRoleReturn {
  hasRole: (role: string) => boolean;
  isLoading: boolean;
  error: string | null;
}

export const useUserRole = (): UseUserRoleReturn => {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc('get_user_roles', {
          _user_id: user.id
        });

        if (error) {
          setError(error.message);
          return;
        }

        setUserRoles(data?.map((item: { role: string }) => item.role) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  return { hasRole, isLoading, error };
};