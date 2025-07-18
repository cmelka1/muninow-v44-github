import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CrossTabSessionOptions {
  onExternalSessionChange: (newSessionId: string | null) => void;
}

export const useCrossTabSession = ({ onExternalSessionChange }: CrossTabSessionOptions) => {
  const currentSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Generate unique session ID for this tab
    const tabSessionId = `session_${Date.now()}_${Math.random()}`;
    
    // Storage event listener for cross-tab communication
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'active_session_id' && event.newValue !== tabSessionId) {
        // Another tab has taken over the session
        if (event.newValue && event.newValue !== currentSessionIdRef.current) {
          onExternalSessionChange(event.newValue);
        }
      }
    };

    // Listen for storage changes from other tabs
    window.addEventListener('storage', handleStorageChange);

    // Set initial session ID
    const setSessionId = (sessionId: string | null) => {
      if (sessionId) {
        localStorage.setItem('active_session_id', tabSessionId);
        currentSessionIdRef.current = sessionId;
      } else {
        localStorage.removeItem('active_session_id');
        currentSessionIdRef.current = null;
      }
    };

    // Monitor auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setSessionId(session.user.id);
        } else {
          setSessionId(null);
        }
      }
    );

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setSessionId(session.user.id);
      }
    });

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      subscription.unsubscribe();
    };
  }, [onExternalSessionChange]);

  return {
    clearSession: () => {
      localStorage.removeItem('active_session_id');
      currentSessionIdRef.current = null;
    }
  };
};