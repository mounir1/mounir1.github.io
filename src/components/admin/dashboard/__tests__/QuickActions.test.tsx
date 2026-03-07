import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import { QuickActions } from '../QuickActions';
import { Plus, FileText, Settings } from 'lucide-react';

describe('QuickActions', () => {
  const mockActions = [
    {
      id: 'add-project',
      label: 'Add New Project',
      description: 'Create a new project',
      icon: Plus,
      onClick: vi.fn(),
    },
    {
      id: 'add-skill',
      label: 'Add New Skill',
      description: 'Add a new skill',
      icon: FileText,
      onClick: vi.fn(),
      badge: 'New',
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Configure settings',
      icon: Settings,
      onClick: vi.fn(),
      disabled: true,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all quick actions', () => {
    render(<QuickActions actions={mockActions} />);

    expect(screen.getByText('Add New Project')).toBeInTheDocument();
    expect(screen.getByText('Create a new project')).toBeInTheDocument();
    expect(screen.getByText('Add New Skill')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('handles action clicks', () => {
    render(<QuickActions actions={mockActions} />);

    const addProjectButton = screen
      .getByText('Add New Project')
      .closest('button');
    fireEvent.click(addProjectButton!);

    expect(mockActions[0].onClick).toHaveBeenCalledTimes(1);
  });

  it('shows badges when present', () => {
    render(<QuickActions actions={mockActions} />);

    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('disables actions when specified', () => {
    render(<QuickActions actions={mockActions} />);

    const settingsButton = screen.getByText('Settings').closest('button');
    expect(settingsButton).toBeDisabled();
  });

  it('renders in grid layout by default', () => {
    render(<QuickActions actions={mockActions} />);

    const container = screen.getByRole('region', { name: /quick actions/i });
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });

  it('renders in list layout when specified', () => {
    render(<QuickActions actions={mockActions} layout="list" />);

    const container = screen.getByRole('region', { name: /quick actions/i });
    expect(container.querySelector('.space-y-2')).toBeInTheDocument();
  });

  it('limits displayed actions when maxItems is set', () => {
    render(<QuickActions actions={mockActions} maxItems={2} />);

    expect(screen.getByText('Add New Project')).toBeInTheDocument();
    expect(screen.getByText('Add New Skill')).toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
  });

  it('handles empty actions array', () => {
    render(<QuickActions actions={[]} />);

    expect(screen.getByText('No quick actions available')).toBeInTheDocument();
  });
});
