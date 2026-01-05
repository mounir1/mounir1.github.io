import { useState, useEffect } from 'react';
import { User, signInWithEmailAndPassword, signOut, onAuthStateChanged, signInWithPopup } from 'firebase/auth';
import { auth, isFirebaseEnabled, GithubAuthProvider } from '@/lib/firebase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: auth?.currentUser ?? null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthState(prev => ({
        ...prev,
        user,
        loading: false,
      }));
    });

    return () => unsubscribe();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Auth is not available');
    }

    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      await signInWithEmailAndPassword(auth, credentials.email, credentials.password);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    if (!auth) return;

    try {
      await signOut(auth);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const loginWithGitHub = async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase Auth is not available');
    }

    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));

    try {
      const provider = new GithubAuthProvider();
      // Add scopes if needed
      // provider.addScope('repo');
      // provider.addScope('user:email');
      
      await signInWithPopup(auth, provider);
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'GitHub login failed. Please try again.';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
      }));
      throw error;
    }
  };

  const clearError = () => {
    setAuthState(prev => ({
      ...prev,
      error: null,
    }));
  };

  const isAuthenticated = !!authState.user;
  const canUseAdmin = isFirebaseEnabled && !!auth;

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    isAuthenticated,
    canUseAdmin,
    login,
    logout,
    loginWithGitHub,
    clearError,
  };
}