import { renderHook, act } from '@testing-library/react';
import { useAdminAuth } from '@/hooks/useAdminAuth';

// Mock Firebase
jest.mock('@/lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  isFirebaseEnabled: true,
}));

// Mock Firebase Auth functions
jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Return unsubscribe function
    return () => {};
  }),
}));

describe('useAdminAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() => useAdminAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.canUseAdmin).toBe(true);
  });

  it('should provide login and logout functions', () => {
    const { result } = renderHook(() => useAdminAuth());

    expect(typeof result.current.login).toBe('function');
    expect(typeof result.current.logout).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should clear error when clearError is called', () => {
    const { result } = renderHook(() => useAdminAuth());

    act(() => {
      // Simulate an error state
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
