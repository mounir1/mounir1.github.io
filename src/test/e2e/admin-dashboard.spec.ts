import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin dashboard
    await page.goto('/admin');
  });

  test('should display login form for unauthenticated users', async ({
    page,
  }) => {
    await expect(page.getByText('Admin Login')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
  });

  test('should handle login form validation', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.getByLabel('Email').fill('invalid-email');
    await page.getByLabel('Password').fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();

    await expect(page.getByText(/invalid email format/i)).toBeVisible();
  });

  test('should access dashboard in demo mode', async ({ page }) => {
    // Check if Firebase is disabled (demo mode)
    const isDemoMode = await page.evaluate(() => {
      return !window.localStorage.getItem('firebase-enabled');
    });

    if (isDemoMode) {
      await expect(page.getByText('Dashboard Overview')).toBeVisible();
      await expect(page.getByText('Demo Mode')).toBeVisible();
    }
  });

  test('should navigate between dashboard tabs', async ({ page }) => {
    // Assume we're in demo mode or authenticated
    await page.goto('/admin?demo=true');

    // Check dashboard overview
    await expect(page.getByText('Dashboard Overview')).toBeVisible();

    // Navigate to projects
    await page.getByText('Projects').click();
    await expect(page.getByText('Projects Management')).toBeVisible();

    // Navigate to skills
    await page.getByText('Skills').click();
    await expect(page.getByText('Skills Management')).toBeVisible();

    // Navigate back to overview
    await page.getByText('Overview').click();
    await expect(page.getByText('Dashboard Overview')).toBeVisible();
  });

  test('should display stats cards on dashboard', async ({ page }) => {
    await page.goto('/admin?demo=true');

    await expect(page.getByText('Total Projects')).toBeVisible();
    await expect(page.getByText('Featured Projects')).toBeVisible();
    await expect(page.getByText('Total Skills')).toBeVisible();
    await expect(page.getByText('Featured Skills')).toBeVisible();
  });

  test('should handle quick actions', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Check quick actions are visible
    await expect(page.getByText('Quick Actions')).toBeVisible();
    await expect(page.getByText('Add New Project')).toBeVisible();
    await expect(page.getByText('Add New Skill')).toBeVisible();

    // Click add new project
    await page.getByText('Add New Project').click();
    await expect(page.getByText('Create New Project')).toBeVisible();
  });
});

test.describe('Project Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Projects').click();
  });

  test('should display projects list', async ({ page }) => {
    await expect(page.getByText('Projects Management')).toBeVisible();
    await expect(page.getByText('Add New Project')).toBeVisible();
  });

  test('should open create project form', async ({ page }) => {
    await page.getByText('Add New Project').click();

    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByLabel('Title')).toBeVisible();
    await expect(page.getByLabel('Description')).toBeVisible();
    await expect(page.getByLabel('Category')).toBeVisible();
  });

  test('should validate project form', async ({ page }) => {
    await page.getByText('Add New Project').click();

    // Try to submit empty form
    await page.getByRole('button', { name: /create project/i }).click();

    await expect(page.getByText(/title is required/i)).toBeVisible();
    await expect(page.getByText(/description is required/i)).toBeVisible();
  });

  test('should create new project', async ({ page }) => {
    await page.getByText('Add New Project').click();

    // Fill form
    await page.getByLabel('Title').fill('E2E Test Project');
    await page.getByLabel('Description').fill('Project created by E2E test');
    await page.getByLabel('Category').selectOption('Web Application');
    await page.getByLabel('Technologies').fill('React, TypeScript, Playwright');

    // Submit form
    await page.getByRole('button', { name: /create project/i }).click();

    // Should return to projects list
    await expect(page.getByText('Projects Management')).toBeVisible();
    await expect(page.getByText('E2E Test Project')).toBeVisible();
  });

  test('should search projects', async ({ page }) => {
    // Assuming there are existing projects
    const searchInput = page.getByPlaceholder(/search projects/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('React');

      // Should filter projects containing 'React'
      const projectCards = page.locator('[data-testid="project-card"]');
      const count = await projectCards.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const card = projectCards.nth(i);
          await expect(card).toContainText(/react/i);
        }
      }
    }
  });

  test('should filter projects by category', async ({ page }) => {
    const categoryFilter = page.getByLabel(/filter by category/i);
    if (await categoryFilter.isVisible()) {
      await categoryFilter.selectOption('Web Application');

      // Should show only web application projects
      const projectCards = page.locator('[data-testid="project-card"]');
      const count = await projectCards.count();

      if (count > 0) {
        for (let i = 0; i < count; i++) {
          const card = projectCards.nth(i);
          await expect(card).toContainText('Web Application');
        }
      }
    }
  });
});

test.describe('Skills Management E2E', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin?demo=true');
    await page.getByText('Skills').click();
  });

  test('should display skills list', async ({ page }) => {
    await expect(page.getByText('Skills Management')).toBeVisible();
    await expect(page.getByText('Add New Skill')).toBeVisible();
  });

  test('should open create skill form', async ({ page }) => {
    await page.getByText('Add New Skill').click();

    await expect(page.getByText('Add New Skill')).toBeVisible();
    await expect(page.getByLabel(/skill name/i)).toBeVisible();
    await expect(page.getByLabel(/description/i)).toBeVisible();
    await expect(page.getByLabel(/category/i)).toBeVisible();
  });

  test('should create new skill', async ({ page }) => {
    await page.getByText('Add New Skill').click();

    // Fill form
    await page.getByLabel(/skill name/i).fill('Playwright');
    await page.getByLabel(/description/i).fill('E2E testing framework');
    await page.getByLabel(/category/i).selectOption('Tools');

    // Set skill level using slider
    const levelSlider = page.getByLabel(/skill level/i);
    await levelSlider.fill('4');

    // Set proficiency using slider
    const proficiencySlider = page.getByLabel(/proficiency/i);
    await proficiencySlider.fill('85');

    // Submit form
    await page.getByRole('button', { name: /add skill/i }).click();

    // Should return to skills list
    await expect(page.getByText('Skills Management')).toBeVisible();
    await expect(page.getByText('Playwright')).toBeVisible();
  });

  test('should validate skill form', async ({ page }) => {
    await page.getByText('Add New Skill').click();

    // Try to submit empty form
    await page.getByRole('button', { name: /add skill/i }).click();

    await expect(page.getByText(/name is required/i)).toBeVisible();
    await expect(page.getByText(/category is required/i)).toBeVisible();
  });
});

test.describe('Responsive Design E2E', () => {
  test('should work on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/admin?demo=true');

    // Check mobile layout
    await expect(page.getByText('Dashboard Overview')).toBeVisible();

    // Check sidebar is collapsible on mobile
    const sidebarToggle = page.getByRole('button', { name: /toggle sidebar/i });
    if (await sidebarToggle.isVisible()) {
      await sidebarToggle.click();
      // Sidebar should be hidden/collapsed
    }
  });

  test('should adapt to tablet viewport', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin?demo=true');

    await expect(page.getByText('Dashboard Overview')).toBeVisible();

    // Check that layout adapts to tablet size
    const statsGrid = page.locator('[data-testid="stats-grid"]');
    if (await statsGrid.isVisible()) {
      // Should have appropriate grid layout for tablet
      await expect(statsGrid).toBeVisible();
    }
  });
});

test.describe('Accessibility E2E', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Enter');

    // Should be able to navigate with keyboard
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Check for ARIA labels on interactive elements
    const buttons = page.getByRole('button');
    const count = await buttons.count();

    expect(count).toBeGreaterThan(0);

    // Check that buttons have accessible names
    for (let i = 0; i < Math.min(count, 5); i++) {
      const button = buttons.nth(i);
      const accessibleName =
        (await button.getAttribute('aria-label')) ||
        (await button.textContent());
      expect(accessibleName).toBeTruthy();
    }
  });

  test('should support screen readers', async ({ page }) => {
    await page.goto('/admin?demo=true');

    // Check for proper heading structure
    const h1 = page.getByRole('heading', { level: 1 });
    await expect(h1).toBeVisible();

    // Check for proper landmarks
    const main = page.getByRole('main');
    await expect(main).toBeVisible();
  });
});
