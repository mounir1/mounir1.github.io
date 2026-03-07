import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AnalyticsDashboard } from '../AnalyticsDashboard';

// Mock the hooks
vi.mock('@/hooks/useProjects', () => ({
  useProjects: () => ({
    projects: [
      {
        id: '1',
        title: 'Test Project',
        featured: true,
        disabled: false,
        status: 'completed',
        category: 'Web Application',
      },
    ],
    loading: false,
  }),
}));

vi.mock('@/hooks/useSkills', () => ({
  useSkills: () => ({
    skills: [
      {
        id: '1',
        name: 'React',
        featured: true,
        level: 90,
        category: 'Frontend',
      },
    ],
    loading: false,
  }),
}));

vi.mock('@/hooks/useUserTracking', () => ({
  useUserTracking: () => ({
    events: [
      {
        id: '1',
        type: 'page_view',
        timestamp: Date.now(),
        metadata: { path: '/' },
      },
      {
        id: '2',
        type: 'click',
        timestamp: Date.now(),
        target: 'button',
        metadata: { coordinates: { x: 100, y: 200 } },
      },
    ],
    getEventStats: () => ({ totalEvents: 2 }),
    isTracking: true,
    setIsTracking: vi.fn(),
  }),
}));

vi.mock('@/hooks/usePerformanceMonitoring', () => ({
  usePerformanceMonitoring: () => ({
    metrics: {
      LCP: 1500,
      FID: 50,
      CLS: 0.05,
    },
    isMonitoring: true,
    startMonitoring: vi.fn(),
    stopMonitoring: vi.fn(),
  }),
}));

describe('AnalyticsDashboard', () => {
  it('renders analytics dashboard with all tabs', () => {
    render(<AnalyticsDashboard />);

    // Check if main title is present
    expect(screen.getByText('Analytics Dashboard')).toBeInTheDocument();

    // Check if all tabs are present
    expect(screen.getByText('Overview')).toBeInTheDocument();
    expect(screen.getByText('Visitors')).toBeInTheDocument();
    expect(screen.getByText('Heatmap')).toBeInTheDocument();
    expect(screen.getByText('Performance')).toBeInTheDocument();
    expect(screen.getByText('A/B Testing')).toBeInTheDocument();
    expect(screen.getByText('Projects')).toBeInTheDocument();
    expect(screen.getByText('Skills')).toBeInTheDocument();
  });

  it('displays visitor metrics', () => {
    render(<AnalyticsDashboard />);

    // Check if visitor metrics are displayed
    expect(screen.getByText('Total Visitors')).toBeInTheDocument();
    expect(screen.getByText('User Interactions')).toBeInTheDocument();
    expect(screen.getByText('Heatmap Points')).toBeInTheDocument();
  });

  it('shows tracking controls', () => {
    render(<AnalyticsDashboard />);

    // Check if tracking controls are present
    expect(screen.getByText('User Tracking')).toBeInTheDocument();
    expect(screen.getByText('Performance Monitor')).toBeInTheDocument();
  });
});
