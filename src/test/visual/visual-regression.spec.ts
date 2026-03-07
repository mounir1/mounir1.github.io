import { test, expect } from '@playwright/test';

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set consistent viewport for visual tests
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('should match dashboard overview screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Wait for content to load
    await page.waitForSelector('[data-testid="dashboard-overview"]', {
      timeout: 5000,
    });

    // Hide dynamic content that changes (timestamps, etc.)
    await page.addStyleTag({
      content: `
        [data-testid="timestamp"],
        [data-testid="last-updated"],
        .animate-pulse {
          visibility: hidden !important;
        }
      `,
    });

    await expect(page).toHaveScreenshot('dashboard-overview.png');
  });

  test('should match projects list screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Wait for projects to load
    await page.waitForSelector('[data-testid="projects-list"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('projects-list.png');
  });

  test('should match project form screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();
    await page.getByText('Add New Project').click();

    // Wait for form to load
    await page.waitForSelector('[data-testid="project-form"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('project-form.png');
  });

  test('should match skills list screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Skills').click();

    // Wait for skills to load
    await page.waitForSelector('[data-testid="skills-list"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('skills-list.png');
  });

  test('should match skill form screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Skills').click();
    await page.getByText('Add New Skill').click();

    // Wait for form to load
    await page.waitForSelector('[data-testid="skill-form"]', { timeout: 5000 });

    await expect(page).toHaveScreenshot('skill-form.png');
  });

  test('should match login form screenshot', async ({ page }) => {
    // Mock Firebase as enabled to show login form
    await page.addInitScript(() => {
      window.localStorage.setItem('firebase-enabled', 'true');
    });

    await page.goto('/admin');

    // Wait for login form to load
    await page.waitForSelector('[data-testid="login-form"]', { timeout: 5000 });

    await expect(page).toHaveScreenshot('login-form.png');
  });

  test('should match mobile dashboard screenshot', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin?demo=true');

    // Wait for mobile layout to render
    await page.waitForSelector('[data-testid="dashboard-overview"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('mobile-dashboard.png');
  });

  test('should match tablet dashboard screenshot', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin?demo=true');

    // Wait for tablet layout to render
    await page.waitForSelector('[data-testid="dashboard-overview"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('tablet-dashboard.png');
  });

  test('should match dark theme screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Switch to dark theme
    const themeToggle = page.getByRole('button', { name: /toggle theme/i });
    if (await themeToggle.isVisible()) {
      await themeToggle.click();

      // Wait for theme transition
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('dashboard-dark-theme.png');
    }
  });

  test('should match error state screenshot', async ({ page }) => {
    // Mock network error
    await page.route('**/api/**', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Wait for error state to appear
    await page.waitForSelector('[data-testid="error-message"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('error-state.png');
  });

  test('should match loading state screenshot', async ({ page }) => {
    // Slow down network to capture loading state
    await page.route('**/api/**', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });

    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Capture loading state
    await page.waitForSelector('[data-testid="loading-spinner"]', {
      timeout: 1000,
    });

    await expect(page).toHaveScreenshot('loading-state.png');
  });

  test('should match empty state screenshot', async ({ page }) => {
    // Mock empty data response
    await page.route('**/api/projects', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Wait for empty state to appear
    await page.waitForSelector('[data-testid="empty-state"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('empty-state.png');
  });

  test('should match form validation screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();
    await page.getByText('Add New Project').click();

    // Submit empty form to trigger validation
    await page.getByRole('button', { name: /create project/i }).click();

    // Wait for validation errors to appear
    await page.waitForSelector('[data-testid="validation-error"]', {
      timeout: 5000,
    });

    await expect(page).toHaveScreenshot('form-validation.png');
  });

  test('should match confirmation dialog screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Assuming there's at least one project to delete
    const deleteButton = page.getByRole('button', { name: /delete/i }).first();
    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Wait for confirmation dialog
      await page.waitForSelector('[data-testid="confirm-dialog"]', {
        timeout: 5000,
      });

      await expect(page).toHaveScreenshot('confirmation-dialog.png');
    }
  });

  test('should match sidebar collapsed screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Collapse sidebar
    const sidebarToggle = page.getByRole('button', { name: /toggle sidebar/i });
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();

      // Wait for animation to complete
      await page.waitForTimeout(300);

      await expect(page).toHaveScreenshot('sidebar-collapsed.png');
    }
  });

  test('should match breadcrumb navigation screenshot', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();
    await page.getByText('Add New Project').click();

    // Wait for breadcrumb to update
    await page.waitForSelector('[data-testid="breadcrumb"]', { timeout: 5000 });

    // Focus on breadcrumb area
    const breadcrumb = page.locator('[data-testid="breadcrumb"]');
    await expect(breadcrumb).toHaveScreenshot('breadcrumb-navigation.png');
  });
});

test.describe('Component Visual Tests', () => {
  test('should match stat card component', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Focus on a single stat card
    const statCard = page.locator('[data-testid="stat-card"]').first();
    await expect(statCard).toHaveScreenshot('stat-card.png');
  });

  test('should match project card component', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Focus on a single project card
    const projectCard = page.locator('[data-testid="project-card"]').first();
    if (await projectCard.isVisible()) {
      await expect(projectCard).toHaveScreenshot('project-card.png');
    }
  });

  test('should match skill card component', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Skills').click();

    // Focus on a single skill card
    const skillCard = page.locator('[data-testid="skill-card"]').first();
    if (await skillCard.isVisible()) {
      await expect(skillCard).toHaveScreenshot('skill-card.png');
    }
  });

  test('should match data table component', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();

    // Switch to table view if available
    const tableViewButton = page.getByRole('button', { name: /table view/i });
    if (await tableViewButton.isVisible()) {
      await tableViewButton.click();

      const dataTable = page.locator('[data-testid="data-table"]');
      await expect(dataTable).toHaveScreenshot('data-table.png');
    }
  });

  test('should match form field components', async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();
    await page.getByText('Add New Project').click();

    // Focus on form fields
    const formFields = page.locator('[data-testid="form-fields"]');
    await expect(formFields).toHaveScreenshot('form-fields.png');
  });
});
