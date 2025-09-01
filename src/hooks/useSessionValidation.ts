// Simplified session validation - no longer needed with SimpleAuthContext
import { useAuth } from '@/contexts/SimpleAuthContext';

export const useSessionValidation = () => {
  const { user } = useAuth();

  return {
    validateAndRefreshSession: async () => !!user,
    ensureValidSession: async () => !!user,
    isSessionValid: () => !!user
  };
};