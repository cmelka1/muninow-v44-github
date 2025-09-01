import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { useAuth } from '@/contexts/AuthContext';

interface DashboardProtectedRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export const DashboardProtectedRoute: React.FC<DashboardProtectedRouteProps> = ({
  children,
  redirectTo = '/signin'
}) => {
  const { user, isLoading: authLoading } = useAuth();
  const { hasRole, isLoading: roleLoading, error } = useUserRole();

  if (authLoading || roleLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Allow any user with resident roles (residentUser, residentAdmin) to access dashboard
  const hasValidRole = hasRole('residentUser') || hasRole('residentAdmin');
  
  if (error || !hasValidRole) {
    console.warn('Dashboard access denied:', { error, hasValidRole });
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
};