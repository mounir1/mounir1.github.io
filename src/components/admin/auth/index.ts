/**
 * Admin Auth Components
 */

export { AdminAuth } from './AdminAuth';
export { AuthGuard } from './AuthGuard';
export { LoginForm } from './LoginForm';

export type { AdminAuthProps, AuthGuardProps, LoginFormProps } from './types';

export default {
  AdminAuth: () => import('./AdminAuth'),
  LoginForm: () => import('./LoginForm'),
  AuthGuard: () => import('./AuthGuard'),
};
