import React from 'react';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { AuthGuard } from './AuthGuard';

interface AdminAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * AdminAuth wrapper component that provides authentication context
 * and guards admin routes. This is the main entry point for admin authentication.
 */
export function AdminAuth({ children, fallback }: AdminAuthProps) {
  return <AuthGuard fallback={fallback}>{children}</AuthGuard>;
}

// Export the hook for components that need direct access to auth state
export { useAdminAuth } from '@/hooks/useAdminAuth';
