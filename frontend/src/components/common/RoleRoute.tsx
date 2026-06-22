import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return allowedRoles.includes(user.role) ? (
    <>{children}</>
  ) : (
    <Navigate to="/dashboard" replace />
  );
};
export default RoleRoute;
