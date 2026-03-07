import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { ProjectForm } from '../ProjectForm';
import { mockProject } from '@/test/utils';

describe('ProjectForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders form in create mode', () => {
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Create New Project')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /create project/i })
    ).toBeInTheDocument();
  });

  it('renders form in edit mode with existing data', () => {
    const project = mockProject();
    render(
      <ProjectForm
        mode="edit"
        project={project}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Edit Project')).toBeInTheDocument();
    expect(screen.getByDisplayValue(project.title)).toBeInTheDocument();
    expect(screen.getByDisplayValue(project.description)).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /update project/i })
    ).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const submitButton = screen.getByRole('button', {
      name: /create project/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
    });

    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid data', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const categorySelect = screen.getByLabelText(/category/i);

    await user.type(titleInput, 'Test Project');
    await user.type(descriptionInput, 'Test Description');
    await user.selectOptions(categorySelect, 'Web Application');

    const submitButton = screen.getByRole('button', {
      name: /create project/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Test Project',
          description: 'Test Description',
          category: 'Web Application',
        })
      );
    });
  });

  it('handles cancel action', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('handles technology tags input', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const techInput = screen.getByLabelText(/technologies/i);
    await user.type(techInput, 'React, TypeScript, Node.js');

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await user.type(titleInput, 'Test Project');
    await user.type(descriptionInput, 'Test Description');

    const submitButton = screen.getByRole('button', {
      name: /create project/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          technologies: ['React', 'TypeScript', 'Node.js'],
        })
      );
    });
  });

  it('toggles featured status', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const featuredCheckbox = screen.getByLabelText(/featured/i);
    await user.click(featuredCheckbox);

    expect(featuredCheckbox).toBeChecked();
  });

  it('shows loading state during submission', () => {
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading
      />
    );

    const submitButton = screen.getByRole('button', { name: /creating/i });
    expect(submitButton).toBeDisabled();
  });

  it('displays error message', () => {
    const errorMessage = 'Failed to create project';
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        error={errorMessage}
      />
    );

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('handles image upload', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const imageUpload = screen.getByLabelText(/project images/i);
    expect(imageUpload).toBeInTheDocument();

    // Test file upload would require more complex mocking
    // This tests that the component renders the upload field
  });

  it('validates URL fields', async () => {
    const user = userEvent.setup();
    render(
      <ProjectForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const liveUrlInput = screen.getByLabelText(/live url/i);
    await user.type(liveUrlInput, 'invalid-url');

    const titleInput = screen.getByLabelText(/title/i);
    const descriptionInput = screen.getByLabelText(/description/i);

    await user.type(titleInput, 'Test Project');
    await user.type(descriptionInput, 'Test Description');

    const submitButton = screen.getByRole('button', {
      name: /create project/i,
    });
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/invalid url format/i)).toBeInTheDocument();
    });
  });
});
