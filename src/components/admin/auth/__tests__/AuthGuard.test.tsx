import React from 'react';
import { render, screen } from '@/test/utils';
import { AuthGuard } from '../AuthGuard';
import { mockUseAdminAuth, mockUser } from '@/test/utils';

describe('AuthGuard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when authenticated', () => {
    mockUseAdminAuth(mockUser(), false);

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });

  it('renders fallback when not authenticated', () => {
    mockUseAdminAuth(null, false);

    render(
      <AuthGuard fallback={<div data-testid="fallback">Please login</div>}>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('fallback')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('renders default fallback when not authenticated and no custom fallback', () => {
    mockUseAdminAuth(null, false);

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Access Denied')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseAdminAuth(null, true);

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('allows access in demo mode', () => {
    vi.mock('@/lib/firebase', () => ({
      isFirebaseEnabled: false,
    }));

    render(
      <AuthGuard>
        <div data-testid="protected-content">Protected Content</div>
      </AuthGuard>
    );

    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
  });
});
