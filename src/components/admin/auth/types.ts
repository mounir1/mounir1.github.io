/**
 * Admin Auth Types
 */

import { BaseProps } from '@/types';

export interface AdminAuthProps extends BaseProps {
  onAuthChange?: (authenticated: boolean) => void;
}

export interface AuthGuardProps extends BaseProps {
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export interface LoginFormProps extends BaseProps {
  onLogin: (credentials: LoginCredentials) => Promise<void>;
  loading?: boolean;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  authenticated: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  avatar?: string;
  lastLogin?: Date;
}

export interface UseAdminAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  canUseAdmin: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  clearError: () => void;
}