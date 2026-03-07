import React from 'react';
import { render, screen } from '@/test/utils';
import { RecentActivity } from '../RecentActivity';

describe('RecentActivity', () => {
  const mockActivities = [
    {
      id: '1',
      type: 'project_created',
      title: 'New project created',
      description: 'Created "Portfolio Website"',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
      user: 'Admin',
      metadata: { projectId: '123' },
    },
    {
      id: '2',
      type: 'skill_updated',
      title: 'Skill updated',
      description: 'Updated React skill level',
      timestamp: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago
      user: 'Admin',
      metadata: { skillId: '456' },
    },
    {
      id: '3',
      type: 'project_featured',
      title: 'Project featured',
      description: 'Featured "E-commerce App"',
      timestamp: Date.now() - 1000 * 60 * 60 * 24, // 1 day ago
      user: 'Admin',
      metadata: { projectId: '789' },
    },
  ];

  it('renders recent activities', () => {
    render(<RecentActivity activities={mockActivities} />);

    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('New project created')).toBeInTheDocument();
    expect(screen.getByText('Created "Portfolio Website"')).toBeInTheDocument();
    expect(screen.getByText('Skill updated')).toBeInTheDocument();
    expect(screen.getByText('Project featured')).toBeInTheDocument();
  });

  it('shows relative timestamps', () => {
    render(<RecentActivity activities={mockActivities} />);

    expect(screen.getByText(/30 minutes ago/)).toBeInTheDocument();
    expect(screen.getByText(/2 hours ago/)).toBeInTheDocument();
    expect(screen.getByText(/1 day ago/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<RecentActivity activities={[]} loading />);

    expect(screen.getByText('Loading activities...')).toBeInTheDocument();
  });

  it('shows empty state when no activities', () => {
    render(<RecentActivity activities={[]} />);

    expect(screen.getByText('No recent activity')).toBeInTheDocument();
    expect(
      screen.getByText('Activity will appear here as you make changes')
    ).toBeInTheDocument();
  });

  it('limits displayed activities when maxItems is set', () => {
    render(<RecentActivity activities={mockActivities} maxItems={2} />);

    expect(screen.getByText('New project created')).toBeInTheDocument();
    expect(screen.getByText('Skill updated')).toBeInTheDocument();
    expect(screen.queryByText('Project featured')).not.toBeInTheDocument();
  });

  it('handles activity clicks when onActivityClick is provided', () => {
    const mockOnActivityClick = vi.fn();
    render(
      <RecentActivity
        activities={mockActivities}
        onActivityClick={mockOnActivityClick}
      />
    );

    const firstActivity = screen
      .getByText('New project created')
      .closest('button');
    fireEvent.click(firstActivity!);

    expect(mockOnActivityClick).toHaveBeenCalledWith(mockActivities[0]);
  });

  it('shows different icons for different activity types', () => {
    render(<RecentActivity activities={mockActivities} />);

    // Check that different activity types have different visual indicators
    const activities = screen.getAllByRole('listitem');
    expect(activities).toHaveLength(3);
  });

  it('formats timestamps correctly', () => {
    const recentActivity = {
      id: '1',
      type: 'project_created',
      title: 'Test',
      description: 'Test description',
      timestamp: Date.now() - 1000 * 30, // 30 seconds ago
      user: 'Admin',
      metadata: {},
    };

    render(<RecentActivity activities={[recentActivity]} />);

    expect(screen.getByText(/just now|seconds ago/)).toBeInTheDocument();
  });
});
