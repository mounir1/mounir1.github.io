# Testing Documentation

This document provides comprehensive information about the testing suite for the Admin Dashboard Optimization project.

## Overview

The testing suite includes multiple types of tests to ensure code quality, functionality, and user experience:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test component interactions and workflows
- **End-to-End Tests**: Test complete user journeys across the application
- **Visual Regression Tests**: Ensure UI consistency across changes
- **Performance Tests**: Monitor application performance metrics
- **Accessibility Tests**: Verify WCAG compliance and screen reader support

## Test Structure

```
src/test/
├── setup.ts                    # Test environment setup
├── utils.tsx                   # Test utilities and helpers
├── config.ts                   # Test configuration and constants
├── integration/                # Integration tests
│   └── admin-workflows.test.tsx
├── e2e/                       # End-to-end tests
│   └── admin-dashboard.spec.ts
├── visual/                    # Visual regression tests
│   └── visual-regression.spec.ts
└── README.md                  # This file

src/components/admin/*/
└── __tests__/                 # Unit tests for each component
    ├── Component.test.tsx
    └── ...
```

## Running Tests

### All Tests

```bash
# Run all tests in sequence
npm run test:all

# Run all tests with test runner
npm run test:runner
```

### Unit Tests

```bash
# Run unit tests once
npm run test:unit

# Run unit tests in watch mode
npm run test:watch

# Run unit tests with UI
npm run test:ui
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Visual Regression Tests

```bash
# Run visual tests
npm run test:visual

# Update visual snapshots
npm run test:visual:update
```

### Coverage Reports

```bash
# Run tests with coverage
npm run test:coverage
```

## Test Configuration

### Vitest Configuration

- **File**: `vitest.config.ts`
- **Environment**: jsdom
- **Coverage**: v8 provider with 80% thresholds
- **Setup**: Automatic cleanup and mocking

### Playwright Configuration

- **File**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit
- **Mobile**: Pixel 5, iPhone 12
- **Features**: Screenshots, traces, parallel execution

## Writing Tests

### Unit Test Example

```typescript
import { render, screen } from '@/test/utils'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('handles user interaction', async () => {
    const mockFn = vi.fn()
    render(<MyComponent onClick={mockFn} />)

    await userEvent.click(screen.getByRole('button'))
    expect(mockFn).toHaveBeenCalledTimes(1)
  })
})
```

### Integration Test Example

```typescript
import { render, screen } from '@/test/utils'
import { AdminDashboard } from '@/components/admin/AdminDashboard'

describe('Admin Workflow', () => {
  it('completes project creation workflow', async () => {
    render(<AdminDashboard />)

    // Navigate to projects
    await userEvent.click(screen.getByText('Projects'))

    // Open form
    await userEvent.click(screen.getByText('Add New Project'))

    // Fill and submit
    await userEvent.type(screen.getByLabelText('Title'), 'Test Project')
    await userEvent.click(screen.getByRole('button', { name: /create/i }))

    // Verify result
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })
})
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('admin dashboard workflow', async ({ page }) => {
  await page.goto('/admin?demo=true');

  // Navigate to projects
  await page.getByText('Projects').click();
  await expect(page.getByText('Projects Management')).toBeVisible();

  // Create new project
  await page.getByText('Add New Project').click();
  await page.getByLabel('Title').fill('E2E Test Project');
  await page.getByRole('button', { name: /create/i }).click();

  // Verify creation
  await expect(page.getByText('E2E Test Project')).toBeVisible();
});
```

## Test Utilities

### Custom Render Function

The `render` function from `@/test/utils` includes all necessary providers:

- React Router
- Theme Provider
- Any other context providers

### Mock Data Generators

```typescript
import { mockProject, mockSkill, mockUser } from '@/test/utils';

const project = mockProject({ title: 'Custom Title' });
const skill = mockSkill({ level: 5 });
const user = mockUser({ email: 'custom@example.com' });
```

### Mock Hooks

```typescript
import { mockUseProjects, mockUseSkills } from '@/test/utils';

// Mock with custom data
mockUseProjects([project1, project2], false);
mockUseSkills([skill1, skill2], true); // loading state
```

## Mocking Strategy

### Firebase Mocking

Firebase is automatically mocked in the test setup to prevent real API calls:

```typescript
vi.mock('@/lib/firebase', () => ({
  auth: { currentUser: null },
  db: {},
  isFirebaseEnabled: false,
}));
```

### Component Mocking

Heavy components can be mocked for faster tests:

```typescript
vi.mock('framer-motion', () => ({
  motion: { div: 'div' },
  AnimatePresence: ({ children }) => children,
}));
```

### API Mocking

Use MSW (Mock Service Worker) for API mocking in integration tests:

```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/projects', (req, res, ctx) => {
    return res(ctx.json([mockProject()]));
  })
);
```

## Coverage Requirements

The project maintains high coverage standards:

- **Statements**: 80%
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%

### Viewing Coverage

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

## Continuous Integration

Tests run automatically on:

- Push to main/develop branches
- Pull requests
- Scheduled runs (nightly)

### GitHub Actions Workflow

- **Unit Tests**: Fast feedback on basic functionality
- **Integration Tests**: Verify component interactions
- **E2E Tests**: Full user journey validation
- **Visual Tests**: UI consistency checks
- **Performance Tests**: Lighthouse CI integration

## Best Practices

### Test Organization

1. **Arrange**: Set up test data and mocks
2. **Act**: Perform the action being tested
3. **Assert**: Verify the expected outcome

### Test Naming

- Use descriptive test names
- Follow the pattern: "should [expected behavior] when [condition]"
- Group related tests with `describe` blocks

### Test Data

- Use factory functions for consistent test data
- Avoid hardcoded values that might change
- Use meaningful test data that reflects real usage

### Async Testing

- Always await async operations
- Use `waitFor` for elements that appear asynchronously
- Handle loading states appropriately

### Accessibility Testing

- Test keyboard navigation
- Verify ARIA labels and roles
- Check color contrast and focus indicators

## Debugging Tests

### Debug Mode

```bash
# Run tests in debug mode
npm run test:watch -- --reporter=verbose

# Run specific test file
npm run test -- MyComponent.test.tsx

# Run tests matching pattern
npm run test -- --grep "should handle user input"
```

### Browser Debugging

```bash
# Run E2E tests in headed mode
npm run test:e2e -- --headed

# Run E2E tests with debug
npm run test:e2e -- --debug
```

### Visual Debugging

```bash
# Update visual snapshots
npm run test:visual:update

# Compare visual diffs
npm run test:visual -- --reporter=html
```

## Performance Considerations

### Test Performance

- Use `vi.mock()` for heavy dependencies
- Avoid unnecessary DOM queries
- Clean up after each test
- Use `beforeEach` and `afterEach` appropriately

### Parallel Execution

- Tests run in parallel by default
- Use `test.describe.serial()` for dependent tests
- Avoid shared state between tests

## Troubleshooting

### Common Issues

1. **Tests timing out**
   - Increase timeout values
   - Check for unresolved promises
   - Verify mock implementations

2. **Flaky tests**
   - Add proper waits for async operations
   - Avoid hardcoded delays
   - Use deterministic test data

3. **Mock issues**
   - Clear mocks between tests
   - Verify mock implementations
   - Check mock call order

4. **Visual test failures**
   - Update snapshots after intentional changes
   - Check for dynamic content
   - Verify consistent test environment

### Getting Help

1. Check the test output for specific error messages
2. Review the test configuration files
3. Consult the testing framework documentation:
   - [Vitest](https://vitest.dev/)
   - [Playwright](https://playwright.dev/)
   - [Testing Library](https://testing-library.com/)

## Maintenance

### Regular Tasks

- Update test snapshots after UI changes
- Review and update test data
- Monitor coverage reports
- Update testing dependencies

### Test Cleanup

- Remove obsolete tests
- Refactor duplicated test code
- Update test documentation
- Archive old test reports
