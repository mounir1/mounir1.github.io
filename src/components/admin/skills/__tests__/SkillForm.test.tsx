import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { SkillForm } from '../SkillForm';
import { mockSkill } from '@/test/utils';

describe('SkillForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form in create mode', () => {
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Add New Skill')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /add skill/i })
    ).toBeInTheDocument();
  });

  it('renders form in edit mode with existing data', () => {
    const skill = mockSkill();
    render(
      <SkillForm
        mode="edit"
        skill={skill}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Skill')).toBeInTheDocument();
    expect(screen.getByDisplayValue(skill.name)).toBeInTheDocument();
    expect(screen.getByDisplayValue(skill.description)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update skill/i })
    ).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', { name: /add skill/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const nameInput = screen.getByLabelText(/skill name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);
    const levelSlider = screen.getByLabelText(/skill level/i);

    await user.type(nameInput, 'React');
    await user.type(descriptionInput, 'Frontend framework');
    await user.selectOptions(categorySelect, 'Frontend');

    // Simulate slider interaction
    fireEvent.change(levelSlider, { target: { value: '4' } });

    const submitButton = screen.getByRole('button', { name: /add skill/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'React',
          description: 'Frontend framework',
          category: 'Frontend',
          level: 4,
        })
      );
    });
  });

  it('handles proficiency slider', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const proficiencySlider = screen.getByLabelText(/proficiency/i);
    fireEvent.change(proficiencySlider, { target: { value: '85' } });

    expect(screen.getByText('85%')).toBeInTheDocument();
  });

  it('handles experience input', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const yearsInput = screen.getByLabelText(/years of experience/i);
    const monthsInput = screen.getByLabelText(/months/i);

    await user.clear(yearsInput);
    await user.type(yearsInput, '3');
    await user.clear(monthsInput);
    await user.type(monthsInput, '6');

    const nameInput = screen.getByLabelText(/skill name/i);
    const categorySelect = screen.getByLabelText(/category/i);

    await user.type(nameInput, 'React');
    await user.selectOptions(categorySelect, 'Frontend');

    const submitButton = screen.getByRole('button', { name: /add skill/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          experience: { years: 3, months: 6 },
        })
      );
    });
  });

  it('toggles featured status', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const featuredCheckbox = screen.getByLabelText(/featured skill/i);
    await user.click(featuredCheckbox);

    expect(featuredCheckbox).toBeChecked();
  });

  it('handles color picker', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const colorInput = screen.getByLabelText(/skill color/i);
    await user.clear(colorInput);
    await user.type(colorInput, '#FF5733');

    expect(colorInput).toHaveValue('#FF5733');
  });

  it('handles tags input', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const tagsInput = screen.getByLabelText(/tags/i);
    await user.type(tagsInput, 'frontend, javascript, library');

    const nameInput = screen.getByLabelText(/skill name/i);
    const categorySelect = screen.getByLabelText(/category/i);

    await user.type(nameInput, 'React');
    await user.selectOptions(categorySelect, 'Frontend');

    const submitButton = screen.getByRole('button', { name: /add skill/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          tags: ['frontend', 'javascript', 'library'],
        })
      );
    });
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('shows loading state during submission', () => {
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading
      />
    );

    const submitButton = screen.getByRole('button', { name: /adding/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message', () => {
    const errorMessage = 'Failed to create skill';
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('validates proficiency range', async () => {
    const user = userEvent.setup();
    render(
      <SkillForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const proficiencySlider = screen.getByLabelText(/proficiency/i);

    // Test minimum value
    fireEvent.change(proficiencySlider, { target: { value: '-10' } });
    expect(proficiencySlider).toHaveValue('0');

    // Test maximum value
    fireEvent.change(proficiencySlider, { target: { value: '150' } });
    expect(proficiencySlider).toHaveValue('100');
  });
});
