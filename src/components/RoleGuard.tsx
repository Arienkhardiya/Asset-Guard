import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { userData, loading } = useAuth();

  if (loading) return null;

  if (!userData) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = userData.role === 'Admin' || allowedRoles.includes(userData.role);

  if (!hasAccess) {
    // Redirect to the first available dashboard they DO have access to
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
