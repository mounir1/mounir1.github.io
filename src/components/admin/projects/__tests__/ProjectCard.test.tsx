import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import { ProjectCard } from '../ProjectCard';
import { mockProject } from '@/test/utils';

describe('ProjectCard', () => {
  const defaultProject = mockProject();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleStatus = vi.fn();
  const mockOnToggleFeatured = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders project information', () => {
    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText(defaultProject.title)).toBeInTheDocument();
    expect(screen.getByText(defaultProject.description)).toBeInTheDocument();
    expect(screen.getByText(defaultProject.category)).toBeInTheDocument();
    expect(screen.getByText(defaultProject.status)).toBeInTheDocument();
  });

  it('displays technologies as badges', () => {
    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    defaultProject.technologies.forEach(tech => {
      expect(screen.getByText(tech)).toBeInTheDocument();
    });
  });

  it('shows featured badge when project is featured', () => {
    const featuredProject = { ...defaultProject, featured: true };
    render(
      <ProjectCard
        project={featuredProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('handles edit action', () => {
    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(defaultProject);
  });

  it('handles delete action with confirmation', async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      `Are you sure you want to delete "${defaultProject.title}"?`
    );
    expect(mockOnDelete).toHaveBeenCalledWith(defaultProject.id);

    confirmSpy.mockRestore();
  });

  it('cancels delete when confirmation is denied', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(mockOnDelete).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it('handles toggle featured action', () => {
    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const featuredButton = screen.getByRole('button', {
      name: /toggle featured/i,
    });
    fireEvent.click(featuredButton);

    expect(mockOnToggleFeatured).toHaveBeenCalledWith(defaultProject.id);
  });

  it('handles toggle status action', () => {
    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const statusButton = screen.getByRole('button', { name: /toggle status/i });
    fireEvent.click(statusButton);

    expect(mockOnToggleStatus).toHaveBeenCalledWith(defaultProject.id);
  });

  it('displays project links when available', () => {
    const projectWithLinks = {
      ...defaultProject,
      links: [
        { type: 'live', url: 'https://example.com', label: 'Live Demo' },
        {
          type: 'github',
          url: 'https://github.com/user/repo',
          label: 'Source Code',
        },
      ],
    };

    render(
      <ProjectCard
        project={projectWithLinks}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText('Live Demo')).toBeInTheDocument();
    expect(screen.getByText('Source Code')).toBeInTheDocument();
  });

  it('shows disabled state when project is disabled', () => {
    const disabledProject = { ...defaultProject, disabled: true };
    render(
      <ProjectCard
        project={disabledProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const card = screen.getByRole('article');
    expect(card).toHaveClass('opacity-50');
  });

  it('formats dates correctly', () => {
    render(
      <ProjectCard
        project={defaultProject}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleStatus={mockOnToggleStatus}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    // Check that created date is displayed
    expect(screen.getByText(/created/i)).toBeInTheDocument();
  });
});
