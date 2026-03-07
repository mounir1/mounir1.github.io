import React from 'react';
import { render, screen } from '@/test/utils';
import { AdminAuth } from '../AdminAuth';
import { mockUseAdminAuth, mockUser } from '@/test/utils';

describe('AdminAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form when not authenticated', () => {
    mockUseAdminAuth(null, false);

    render(
      <AdminAuth>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuth>
    );

    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.queryByTestId('admin-content')).not.toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAdminAuth(mockUser(), false);

    render(
      <AdminAuth>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuth>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
    expect(screen.queryByText('Admin Login')).not.toBeInTheDocument();
  });

  it('shows loading state', () => {
    mockUseAdminAuth(null, true);

    render(
      <AdminAuth>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuth>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders demo mode when Firebase is disabled', () => {
    vi.mock('@/lib/firebase', () => ({
      isFirebaseEnabled: false,
    }));

    render(
      <AdminAuth>
        <div data-testid="admin-content">Admin Content</div>
      </AdminAuth>
    );

    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
