import React from 'react';
import { render, screen, fireEvent } from '@/test/utils';
import { SkillCard } from '../SkillCard';
import { mockSkill } from '@/test/utils';

describe('SkillCard', () => {
  const defaultSkill = mockSkill();
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();
  const mockOnToggleFeatured = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skill information', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText(defaultSkill.name)).toBeInTheDocument();
    expect(screen.getByText(defaultSkill.description)).toBeInTheDocument();
    expect(screen.getByText(defaultSkill.category)).toBeInTheDocument();
  });

  it('displays skill level and proficiency', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText(`Level ${defaultSkill.level}`)).toBeInTheDocument();
    expect(
      screen.getByText(`${defaultSkill.proficiency}%`)
    ).toBeInTheDocument();
  });

  it('displays experience information', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const { years, months } = defaultSkill.experience;
    expect(screen.getByText(`${years}y ${months}m`)).toBeInTheDocument();
  });

  it('shows featured badge when skill is featured', () => {
    const featuredSkill = { ...defaultSkill, featured: true };
    render(
      <SkillCard
        skill={featuredSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText('Featured')).toBeInTheDocument();
  });

  it('displays tags as badges', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    defaultSkill.tags.forEach(tag => {
      expect(screen.getByText(tag)).toBeInTheDocument();
    });
  });

  it('handles edit action', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(defaultSkill);
  });

  it('handles delete action with confirmation', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);

    expect(confirmSpy).toHaveBeenCalledWith(
      `Are you sure you want to delete "${defaultSkill.name}"?`
    );
    expect(mockOnDelete).toHaveBeenCalledWith(defaultSkill.id);

    confirmSpy.mockRestore();
  });

  it('cancels delete when confirmation is denied', () => {
    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
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
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const featuredButton = screen.getByRole('button', {
      name: /toggle featured/i,
    });
    fireEvent.click(featuredButton);

    expect(mockOnToggleFeatured).toHaveBeenCalledWith(defaultSkill.id);
  });

  it('displays skill icon when available', () => {
    const skillWithIcon = { ...defaultSkill, icon: 'react-icon' };
    render(
      <SkillCard
        skill={skillWithIcon}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    // Check that icon container is rendered
    const iconContainer = screen.getByRole('img', { hidden: true });
    expect(iconContainer).toBeInTheDocument();
  });

  it('applies custom color when available', () => {
    const skillWithColor = { ...defaultSkill, color: '#FF5733' };
    render(
      <SkillCard
        skill={skillWithColor}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    // Check that color is applied to progress bar or icon
    const colorElement = screen.getByRole('progressbar');
    expect(colorElement).toHaveStyle({ '--progress-color': '#FF5733' });
  });

  it('shows proficiency progress bar', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveAttribute(
      'aria-valuenow',
      defaultSkill.proficiency.toString()
    );
  });

  it('displays certifications count when available', () => {
    const skillWithCertifications = {
      ...defaultSkill,
      certifications: [
        {
          id: '1',
          name: 'React Certification',
          issuer: 'Meta',
          date: '2023-01-01',
        },
        {
          id: '2',
          name: 'Advanced React',
          issuer: 'Udemy',
          date: '2023-06-01',
        },
      ],
    };

    render(
      <SkillCard
        skill={skillWithCertifications}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText('2 Certifications')).toBeInTheDocument();
  });

  it('displays related projects count when available', () => {
    const skillWithProjects = {
      ...defaultSkill,
      projects: ['project1', 'project2', 'project3'],
    };

    render(
      <SkillCard
        skill={skillWithProjects}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    expect(screen.getByText('3 Projects')).toBeInTheDocument();
  });

  it('formats dates correctly', () => {
    render(
      <SkillCard
        skill={defaultSkill}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onToggleFeatured={mockOnToggleFeatured}
      />
    );

    // Check that created date is displayed
    expect(screen.getByText(/added/i)).toBeInTheDocument();
  });
});
