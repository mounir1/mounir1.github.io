import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import { StatsGrid } from '../StatsGrid';
import { mockStats } from '@/test/utils';

describe('StatsGrid', () => {
  const defaultStats = mockStats();

  it('renders all stat cards', () => {
    render(<StatsGrid stats={defaultStats} />);

    expect(screen.getByText('Total Projects')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Featured Projects')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Total Skills')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<StatsGrid stats={defaultStats} loading />);

    const loadingElements = screen.getAllByText('Loading...');
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it('handles stat card clicks', () => {
    const mockOnStatClick = vi.fn();
    render(<StatsGrid stats={defaultStats} onStatClick={mockOnStatClick} />);

    const projectsCard = screen.getByText('Total Projects').closest('button');
    fireEvent.click(projectsCard!);

    expect(mockOnStatClick).toHaveBeenCalledWith('projects');
  });

  it('displays trends when available', () => {
    const statsWithTrends = {
      ...defaultStats,
      projects: {
        ...defaultStats.projects,
        trend: { value: 15, direction: 'up' as const },
      },
    };

    render(<StatsGrid stats={statsWithTrends} showTrends />);

    expect(screen.getByText('+15%')).toBeInTheDocument();
  });

  it('adapts to different column layouts', () => {
    const { rerender } = render(<StatsGrid stats={defaultStats} columns={2} />);

    let grid = screen.getByRole('grid', { hidden: true });
    expect(grid).toHaveClass('grid-cols-2');

    rerender(<StatsGrid stats={defaultStats} columns={4} />);
    grid = screen.getByRole('grid', { hidden: true });
    expect(grid).toHaveClass('grid-cols-4');
  });

  it('handles empty stats gracefully', () => {
    const emptyStats = {
      projects: {
        total: 0,
        featured: 0,
        active: 0,
        categories: 0,
        byStatus: {},
        byCategory: {},
        recentActivity: [],
      },
      skills: {
        total: 0,
        featured: 0,
        byCategory: {},
        averageLevel: 0,
        topSkills: [],
      },
    };

    render(<StatsGrid stats={emptyStats} />);

    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
