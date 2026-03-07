import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import {
  mockUseAdminAuth,
  mockUseProjects,
  mockUseSkills,
  mockUser,
  mockProject,
  mockSkill,
} from '@/test/utils';

describe('Admin Workflows Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAdminAuth(mockUser(), false);
    mockUseProjects([mockProject()], false);
    mockUseSkills([mockSkill()], false);
  });

  describe('Authentication Workflow', () => {
    it('should redirect unauthenticated users to login', () => {
      mockUseAdminAuth(null, false);

      render(<AdminDashboard />);

      expect(screen.getByText('Admin Login')).toBeInTheDocument();
      expect(screen.queryByText('Dashboard Overview')).not.toBeInTheDocument();
    });

    it('should show dashboard after successful authentication', () => {
      render(<AdminDashboard />);

      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
      expect(screen.queryByText('Admin Login')).not.toBeInTheDocument();
    });

    it('should handle logout workflow', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      const userMenu = screen.getByRole('button', { name: /user menu/i });
      await user.click(userMenu);

      const logoutButton = screen.getByText('Sign Out');
      await user.click(logoutButton);

      // Should redirect to login after logout
      await waitFor(() => {
        expect(screen.getByText('Admin Login')).toBeInTheDocument();
      });
    });
  });

  describe('Project Management Workflow', () => {
    it('should navigate to projects tab and display projects', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      expect(screen.getByText('Projects Management')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
    });

    it('should open create project form', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      // Click add project button
      const addButton = screen.getByText('Add New Project');
      await user.click(addButton);

      expect(screen.getByText('Create New Project')).toBeInTheDocument();
    });

    it('should complete project creation workflow', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to projects and open form
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      const addButton = screen.getByText('Add New Project');
      await user.click(addButton);

      // Fill form
      const titleInput = screen.getByLabelText(/title/i);
      const descriptionInput = screen.getByLabelText(/description/i);

      await user.type(titleInput, 'New Test Project');
      await user.type(descriptionInput, 'Test project description');

      // Submit form
      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      });
      await user.click(submitButton);

      // Should return to projects list
      await waitFor(() => {
        expect(screen.getByText('Projects Management')).toBeInTheDocument();
      });
    });

    it('should handle project editing workflow', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      // Click edit on first project
      const editButton = screen.getByRole('button', { name: /edit/i });
      await user.click(editButton);

      expect(screen.getByText('Edit Project')).toBeInTheDocument();
      expect(screen.getByDisplayValue('Test Project')).toBeInTheDocument();
    });

    it('should handle project deletion workflow', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);
      const user = userEvent.setup();

      render(<AdminDashboard />);

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      // Click delete on first project
      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await user.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();

      confirmSpy.mockRestore();
    });
  });

  describe('Skills Management Workflow', () => {
    it('should navigate to skills tab and display skills', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      const skillsTab = screen.getByText('Skills');
      await user.click(skillsTab);

      expect(screen.getByText('Skills Management')).toBeInTheDocument();
      expect(screen.getByText('React')).toBeInTheDocument();
    });

    it('should open create skill form', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to skills
      const skillsTab = screen.getByText('Skills');
      await user.click(skillsTab);

      // Click add skill button
      const addButton = screen.getByText('Add New Skill');
      await user.click(addButton);

      expect(screen.getByText('Add New Skill')).toBeInTheDocument();
    });

    it('should complete skill creation workflow', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to skills and open form
      const skillsTab = screen.getByText('Skills');
      await user.click(skillsTab);

      const addButton = screen.getByText('Add New Skill');
      await user.click(addButton);

      // Fill form
      const nameInput = screen.getByLabelText(/skill name/i);
      const descriptionInput = screen.getByLabelText(/description/i);
      const categorySelect = screen.getByLabelText(/category/i);

      await user.type(nameInput, 'Vue.js');
      await user.type(descriptionInput, 'Progressive framework');
      await user.selectOptions(categorySelect, 'Frontend');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /add skill/i });
      await user.click(submitButton);

      // Should return to skills list
      await waitFor(() => {
        expect(screen.getByText('Skills Management')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Navigation Workflow', () => {
    it('should navigate between different tabs', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Start at dashboard
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);
      expect(screen.getByText('Projects Management')).toBeInTheDocument();

      // Navigate to skills
      const skillsTab = screen.getByText('Skills');
      await user.click(skillsTab);
      expect(screen.getByText('Skills Management')).toBeInTheDocument();

      // Navigate back to dashboard
      const dashboardTab = screen.getByText('Overview');
      await user.click(dashboardTab);
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument();
    });

    it('should update breadcrumb navigation', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('Projects')).toBeInTheDocument();
    });
  });

  describe('Bulk Operations Workflow', () => {
    it('should handle bulk project operations', async () => {
      const user = userEvent.setup();
      const projects = [
        mockProject({ id: '1', title: 'Project 1' }),
        mockProject({ id: '2', title: 'Project 2' }),
        mockProject({ id: '3', title: 'Project 3' }),
      ];

      mockUseProjects(projects, false);
      render(<AdminDashboard />);

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      // Select multiple projects
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Perform bulk action
      const bulkDeleteButton = screen.getByText('Delete Selected');
      expect(bulkDeleteButton).toBeEnabled();
    });

    it('should handle bulk skill operations', async () => {
      const user = userEvent.setup();
      const skills = [
        mockSkill({ id: '1', name: 'React' }),
        mockSkill({ id: '2', name: 'Vue.js' }),
        mockSkill({ id: '3', name: 'Angular' }),
      ];

      mockUseSkills(skills, false);
      render(<AdminDashboard />);

      // Navigate to skills
      const skillsTab = screen.getByText('Skills');
      await user.click(skillsTab);

      // Select multiple skills
      const checkboxes = screen.getAllByRole('checkbox');
      await user.click(checkboxes[0]);
      await user.click(checkboxes[1]);

      // Perform bulk action
      const bulkFeaturedButton = screen.getByText('Toggle Featured');
      expect(bulkFeaturedButton).toBeEnabled();
    });
  });

  describe('Search and Filter Workflow', () => {
    it('should filter projects by search term', async () => {
      const user = userEvent.setup();
      const projects = [
        mockProject({ id: '1', title: 'React Project' }),
        mockProject({ id: '2', title: 'Vue Project' }),
        mockProject({ id: '3', title: 'Angular Project' }),
      ];

      mockUseProjects(projects, false);
      render(<AdminDashboard />);

      // Navigate to projects
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      // Search for React projects
      const searchInput = screen.getByPlaceholderText(/search projects/i);
      await user.type(searchInput, 'React');

      expect(screen.getByText('React Project')).toBeInTheDocument();
      expect(screen.queryByText('Vue Project')).not.toBeInTheDocument();
    });

    it('should filter skills by category', async () => {
      const user = userEvent.setup();
      const skills = [
        mockSkill({ id: '1', name: 'React', category: 'Frontend' }),
        mockSkill({ id: '2', name: 'Node.js', category: 'Backend' }),
        mockSkill({ id: '3', name: 'PostgreSQL', category: 'Database' }),
      ];

      mockUseSkills(skills, false);
      render(<AdminDashboard />);

      // Navigate to skills
      const skillsTab = screen.getByText('Skills');
      await user.click(skillsTab);

      // Filter by Frontend category
      const categoryFilter = screen.getByLabelText(/filter by category/i);
      await user.selectOptions(categoryFilter, 'Frontend');

      expect(screen.getByText('React')).toBeInTheDocument();
      expect(screen.queryByText('Node.js')).not.toBeInTheDocument();
    });
  });

  describe('Error Handling Workflow', () => {
    it('should handle network errors gracefully', async () => {
      mockUseProjects([], false);
      mockUseSkills([], false);

      // Mock network error
      vi.mock('@/hooks/useProjects', () => ({
        useProjects: () => ({
          projects: [],
          loading: false,
          error: 'Network error occurred',
          addProject: vi.fn(),
          updateProject: vi.fn(),
          deleteProject: vi.fn(),
        }),
      }));

      render(<AdminDashboard />);

      const projectsTab = screen.getByText('Projects');
      await userEvent.click(projectsTab);

      expect(screen.getByText(/network error occurred/i)).toBeInTheDocument();
    });

    it('should handle form validation errors', async () => {
      const user = userEvent.setup();
      render(<AdminDashboard />);

      // Navigate to projects and try to create invalid project
      const projectsTab = screen.getByText('Projects');
      await user.click(projectsTab);

      const addButton = screen.getByText('Add New Project');
      await user.click(addButton);

      // Submit empty form
      const submitButton = screen.getByRole('button', {
        name: /create project/i,
      });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });
    });
  });
});
