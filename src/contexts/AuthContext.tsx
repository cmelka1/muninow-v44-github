import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  account_type: string;
  role: string;
  phone?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  business_legal_name?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isSubmitting: boolean;
  loginError: string | null;
  isForgotPasswordOpen: boolean;
  resetSent: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  setForgotPasswordOpen: (open: boolean) => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // Debug logging function
  const logAuthState = (action: string, data?: any) => {
    console.log(`[Auth Debug] ${action}:`, {
      timestamp: new Date().toISOString(),
      hasUser: !!user,
      hasSession: !!session,
      hasProfile: !!profile,
      isLoading,
      isSubmitting,
      ...data
    });
  };

  // Load user profile with timeout protection
  const loadProfile = async (userId: string) => {
    const timeoutId = setTimeout(() => {
      logAuthState('Profile loading timeout');
      setIsLoading(false);
    }, 10000); // 10 second timeout

    try {
      logAuthState('Loading profile', { userId });
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      clearTimeout(timeoutId);

      if (error) {
        console.error('Profile loading error:', error);
        setIsLoading(false);
        return;
      }

      if (data) {
        setProfile(data);
        logAuthState('Profile loaded successfully', { profileEmail: data.email });
      } else {
        logAuthState('No profile found');
      }
      
      setIsLoading(false);
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('Profile loading exception:', error);
      logAuthState('Profile loading failed', { error: error.message });
      setIsLoading(false);
    }
  };

  // Initialize authentication state
  useEffect(() => {
    logAuthState('Initializing auth state');

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logAuthState('Auth state change', { event, hasSession: !!session });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Load profile for authenticated user with timeout protection
          setTimeout(() => {
            loadProfile(session.user.id);
          }, 0);
        } else {
          // Clear profile when user signs out
          setProfile(null);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      logAuthState('Initial session check', { hasSession: !!session });
      
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      logAuthState('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    logAuthState('Sign in attempt', { email });

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        setLoginError(error.message);
        logAuthState('Sign in failed', { error: error.message });
        return { error };
      }

      logAuthState('Sign in successful');
      return { error: null };
    } catch (error: any) {
      setLoginError(error.message);
      logAuthState('Sign in exception', { error: error.message });
      return { error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    logAuthState('Sign up attempt', { email });

    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        setLoginError(error.message);
        logAuthState('Sign up failed', { error: error.message });
        return { error };
      }

      logAuthState('Sign up successful');
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link."
      });
      
      return { error: null };
    } catch (error: any) {
      setLoginError(error.message);
      logAuthState('Sign up exception', { error: error.message });
      return { error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const signOut = async () => {
    logAuthState('Sign out attempt');
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local state
      setProfile(null);
      logAuthState('Sign out successful');
    } catch (error: any) {
      logAuthState('Sign out failed', { error: error.message });
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    logAuthState('Password reset attempt', { email });

    try {
      const redirectUrl = `${window.location.origin}/reset-password`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl
      });
      
      if (error) {
        setLoginError(error.message);
        logAuthState('Password reset failed', { error: error.message });
        return { error };
      }

      setResetSent(true);
      setIsForgotPasswordOpen(false);
      logAuthState('Password reset email sent');
      
      toast({
        title: "Reset email sent",
        description: "Check your email for password reset instructions."
      });
      
      return { error: null };
    } catch (error: any) {
      setLoginError(error.message);
      logAuthState('Password reset exception', { error: error.message });
      return { error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsSubmitting(true);
    setLoginError(null);
    
    logAuthState('Password update attempt');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });
      
      if (error) {
        setLoginError(error.message);
        logAuthState('Password update failed', { error: error.message });
        return { error };
      }

      logAuthState('Password update successful');
      
      toast({
        title: "Password updated",
        description: "Your password has been successfully updated."
      });
      
      return { error: null };
    } catch (error: any) {
      setLoginError(error.message);
      logAuthState('Password update exception', { error: error.message });
      return { error };
    } finally {
      setIsSubmitting(false);
    }
  };

  const setForgotPasswordOpen = (open: boolean) => {
    setIsForgotPasswordOpen(open);
    if (!open) {
      setResetSent(false);
      setLoginError(null);
    }
  };

  const clearError = () => {
    setLoginError(null);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    isLoading,
    isSubmitting,
    loginError,
    isForgotPasswordOpen,
    resetSent,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    setForgotPasswordOpen,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};