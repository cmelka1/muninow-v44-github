import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useSessionValidation = () => {
  const { validateSession, refreshSession, isSessionValid } = useAuth();
  const { toast } = useToast();

  const validateAndRefreshSession = useCallback(async (): Promise<boolean> => {
    // Quick check first - if session is obviously valid, return early
    if (isSessionValid()) {
      return true;
    }

    console.log('Session appears invalid, attempting validation...');
    
    // Try to validate current session
    const isValid = await validateSession();
    
    if (isValid) {
      return true;
    }

    console.log('Session validation failed, attempting refresh...');
    
    // Try to refresh the session
    const refreshSuccess = await refreshSession();
    
    if (refreshSuccess) {
      console.log('Session refreshed successfully');
      return true;
    }

    console.error('Session validation and refresh both failed');
    
    toast({
      title: "Session Expired",
      description: "Your session has expired. Please sign in again to continue.",
      variant: "destructive",
    });

    return false;
  }, [validateSession, refreshSession, isSessionValid, toast]);

  const ensureValidSession = useCallback(async (): Promise<boolean> => {
    try {
      return await validateAndRefreshSession();
    } catch (error) {
      console.error('Session validation error:', error);
      toast({
        title: "Authentication Error",
        description: "There was an issue with your session. Please try signing in again.",
        variant: "destructive",
      });
      return false;
    }
  }, [validateAndRefreshSession, toast]);

  return {
    validateAndRefreshSession,
    ensureValidSession,
    isSessionValid
  };
};