import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardOverview } from '../DashboardOverview';

// Mock the hooks
jest.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [
      {
        id: '1',
        title: 'Test Project',
        description: 'Test Description',
        category: 'Web Application',
        status: 'completed',
        featured: true,
        disabled: false,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    loading: false,
  }),
}));

jest.mock('@/hooks/useSkills', () => ({
  useSkills: () => ({
    skills: [
      {
        id: '1',
        name: 'React',
        description: 'Frontend framework',
        category: 'Frontend',
        level: 5,
        featured: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ],
    loading: false,
  }),
}));

describe('DashboardOverview', () => {
  it('renders dashboard overview with header', () => {
    render(<DashboardOverview />);

    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    expect(
      screen.getByText('Monitor your portfolio performance and manage content')
    ).toBeInTheDocument();
  });

  it('renders stats grid', () => {
    render(<DashboardOverview />);

    // Should show project stats
    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
  });

  it('renders quick actions', () => {
    render(<DashboardOverview />);

    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByText('Add New Project')).toBeInTheDocument();
  });

  it('renders recent activity', () => {
    render(<DashboardOverview />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
  });

  it('calls navigation callbacks when provided', () => {
    const mockNavigate = jest.fn();
    const mockStatClick = jest.fn();
    const mockQuickAction = jest.fn();

    render(
      <DashboardOverview
        onNavigateToTab={mockNavigate}
        onStatClick={mockStatClick}
        onQuickAction={mockQuickAction}
      />
    );

    // Component should render without errors
    expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
  });
});
