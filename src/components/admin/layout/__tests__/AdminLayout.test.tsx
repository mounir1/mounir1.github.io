import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminLayout } from '../AdminLayout';
import { AdminHeader } from '../AdminHeader';
import { AdminSidebar } from '../AdminSidebar';
import { AdminBreadcrumb } from '../AdminBreadcrumb';
import { BarChart3, Database, Plus, Award } from 'lucide-react';

// Mock the theme components
vi.mock('@/components/theme/theme-toggle', () => ({
  ThemeToggle: () => <div data-testid="theme-toggle">Theme Toggle</div>,
}));

vi.mock('@/components/ui/signature', () => ({
  ProfessionalSignature: () => <div data-testid="signature">Signature</div>,
}));

describe('AdminLayout Components', () => {
  describe('AdminLayout', () => {
    it('renders children correctly', () => {
      render(
        <AdminLayout>
          <div data-testid="test-content">Test Content</div>
        </AdminLayout>
      );

      expect(screen.getByTestId('test-content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      const { container } = render(
        <AdminLayout className="custom-class">
          <div>Content</div>
        </AdminLayout>
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('AdminHeader', () => {
    const mockUser = {
      uid: '123',
      email: 'test@example.com',
      displayName: 'Test User',
    };

    const mockOnLogout = vi.fn();

    beforeEach(() => {
      mockOnLogout.mockClear();
    });

    it('renders header with user info', () => {
      render(<AdminHeader user={mockUser} onLogout={mockOnLogout} />);

      expect(screen.getByText('Portfolio Admin')).toBeInTheDocument();
      expect(screen.getByText('Content Management System')).toBeInTheDocument();
    });

    it('calls onLogout when sign out button is clicked', () => {
      render(<AdminHeader user={mockUser} onLogout={mockOnLogout} />);

      const signOutButton = screen.getByText('Sign Out');
      fireEvent.click(signOutButton);

      expect(mockOnLogout).toHaveBeenCalledTimes(1);
    });

    it('renders custom actions', () => {
      const mockAction = vi.fn();
      const actions = [
        {
          label: 'Custom Action',
          icon: BarChart3,
          onClick: mockAction,
        },
      ];

      render(
        <AdminHeader
          user={mockUser}
          onLogout={mockOnLogout}
          actions={actions}
        />
      );

      const actionButton = screen.getByText('Custom Action');
      expect(actionButton).toBeInTheDocument();

      fireEvent.click(actionButton);
      expect(mockAction).toHaveBeenCalledTimes(1);
    });
  });

  describe('AdminSidebar', () => {
    const mockItems = [
      {
        id: 'overview',
        label: 'Overview',
        icon: BarChart3,
        onClick: vi.fn(),
      },
      {
        id: 'projects',
        label: 'Projects',
        icon: Database,
        onClick: vi.fn(),
        badge: '5',
      },
    ];

    it('renders sidebar items', () => {
      render(<AdminSidebar items={mockItems} />);

      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // badge
    });

    it('handles item clicks', () => {
      render(<AdminSidebar items={mockItems} />);

      const overviewButton = screen.getByText('Overview');
      fireEvent.click(overviewButton);

      expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
    });

    it('shows active item correctly', () => {
      render(<AdminSidebar items={mockItems} activeItem="projects" />);

      const projectsButton = screen.getByText('Projects').closest('button');
      expect(projectsButton).toHaveClass('bg-primary');
    });

    it('handles collapse toggle', () => {
      const mockToggle = vi.fn();
      render(
        <AdminSidebar
          items={mockItems}
          collapsed={false}
          onToggle={mockToggle}
        />
      );

      // Find the collapse button (ChevronLeft icon)
      const toggleButton = screen.getByRole('button', { name: /chevron/i });
      fireEvent.click(toggleButton);

      expect(mockToggle).toHaveBeenCalledTimes(1);
    });
  });

  describe('AdminBreadcrumb', () => {
    const mockItems = [
      {
        label: 'Dashboard',
        onClick: vi.fn(),
      },
      {
        label: 'Projects',
        onClick: vi.fn(),
      },
      {
        label: 'Edit Project',
        active: true,
      },
    ];

    it('renders breadcrumb items', () => {
      render(<AdminBreadcrumb items={mockItems} />);

      expect(screen.getByText('Admin')).toBeInTheDocument(); // showHome default
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
      expect(screen.getByText('Edit Project')).toBeInTheDocument();
    });

    it('handles item clicks', () => {
      render(<AdminBreadcrumb items={mockItems} />);

      const dashboardButton = screen.getByText('Dashboard');
      fireEvent.click(dashboardButton);

      expect(mockItems[0].onClick).toHaveBeenCalledTimes(1);
    });

    it('hides home when showHome is false', () => {
      render(<AdminBreadcrumb items={mockItems} showHome={false} />);

      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('shows active item with correct styling', () => {
      render(<AdminBreadcrumb items={mockItems} />);

      const activeItem = screen.getByText('Edit Project');
      expect(activeItem).toHaveClass('text-foreground', 'font-medium');
    });
  });

  describe('Integration', () => {
    it('renders complete layout structure', () => {
      const mockUser = { uid: '123', email: 'test@example.com' };
      const mockOnLogout = vi.fn();
      const mockSidebarItems = [
        {
          id: 'overview',
          label: 'Overview',
          icon: BarChart3,
          onClick: vi.fn(),
        },
      ];
      const mockBreadcrumbItems = [
        {
          label: 'Dashboard',
          onClick: vi.fn(),
        },
      ];

      render(
        <div>
          <AdminHeader user={mockUser} onLogout={mockOnLogout} />
          <div className="flex">
            <AdminSidebar items={mockSidebarItems} />
            <div className="flex-1">
              <AdminLayout>
                <AdminBreadcrumb items={mockBreadcrumbItems} />
                <div data-testid="main-content">Main Content</div>
              </AdminLayout>
            </div>
          </div>
        </div>
      );

      // Verify all components are rendered
      expect(screen.getByText('Portfolio Admin')).toBeInTheDocument();
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByTestId('main-content')).toBeInTheDocument();
    });
  });
});
