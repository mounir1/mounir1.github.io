# Admin Layout Components

This directory contains the core layout components for the admin dashboard, designed to replace the monolithic Admin.tsx structure with modular, reusable components.

## Components

### AdminLayout

The main layout wrapper that provides responsive grid system and consistent spacing.

```tsx
import { AdminLayout } from '@/components/admin/layout';

<AdminLayout>
  <div>Your content here</div>
</AdminLayout>;
```

**Props:**

- `children`: React.ReactNode - Content to render
- `sidebarCollapsed?`: boolean - Whether sidebar is collapsed
- `onSidebarToggle?`: () => void - Sidebar toggle handler
- `className?`: string - Additional CSS classes

### AdminHeader

Sticky header with branding, user actions, and navigation.

```tsx
import { AdminHeader } from '@/components/admin/layout';

<AdminHeader
  user={user}
  onLogout={handleLogout}
  actions={[
    {
      label: 'Settings',
      icon: Settings,
      onClick: () => console.log('Settings'),
      variant: 'outline',
    },
  ]}
/>;
```

**Props:**

- `user`: User | null - Current user object
- `onLogout`: () => void - Logout handler
- `showUserMenu?`: boolean - Show user menu (default: true)
- `actions?`: HeaderAction[] - Custom action buttons
- `className?`: string - Additional CSS classes

### AdminSidebar

Collapsible sidebar navigation with mobile support.

```tsx
import { AdminSidebar } from '@/components/admin/layout';

<AdminSidebar
  items={[
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview',
    },
  ]}
  collapsed={sidebarCollapsed}
  onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
  activeItem={activeTab}
/>;
```

**Props:**

- `items?`: SidebarItem[] - Navigation items
- `collapsed?`: boolean - Collapsed state
- `onToggle?`: () => void - Toggle handler
- `activeItem?`: string - Currently active item ID
- `className?`: string - Additional CSS classes

### AdminBreadcrumb

Breadcrumb navigation for context and hierarchy.

```tsx
import { AdminBreadcrumb } from '@/components/admin/layout';

<AdminBreadcrumb
  items={[
    { label: 'Dashboard', onClick: () => setActiveTab('overview') },
    { label: 'Projects', active: true },
  ]}
/>;
```

**Props:**

- `items`: BreadcrumbItem[] - Breadcrumb items
- `showHome?`: boolean - Show home/admin link (default: true)
- `className?`: string - Additional CSS classes

## Integration Example

Here's how to integrate all components together:

```tsx
import React, { useState } from 'react';
import {
  AdminLayout,
  AdminHeader,
  AdminSidebar,
  AdminBreadcrumb,
} from '@/components/admin/layout';

export const AdminDashboard = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const sidebarItems = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      onClick: () => setActiveTab('overview'),
      active: activeTab === 'overview',
    },
    // ... more items
  ];

  const breadcrumbItems = [
    { label: 'Dashboard', onClick: () => setActiveTab('overview') },
    { label: 'Current Section', active: true },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader user={user} onLogout={onLogout} />

      <div className="flex">
        <AdminSidebar
          items={sidebarItems}
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeItem={activeTab}
        />

        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-68'
          }`}
        >
          <AdminLayout>
            <AdminBreadcrumb items={breadcrumbItems} />
            {/* Your content here */}
          </AdminLayout>
        </div>
      </div>
    </div>
  );
};
```

## Features

### Responsive Design

- **Mobile**: Single column layout, overlay sidebar, touch-friendly controls
- **Tablet**: Optimized spacing, persistent sidebar option
- **Desktop**: Full multi-column layout, hover interactions
- **Wide Screen**: Maximum content width, additional columns

### Grid System

- CSS Grid and Flexbox for optimal layouts
- Responsive breakpoints: mobile (0px), tablet (768px), desktop (1024px), wide (1280px)
- Consistent spacing using Tailwind's spacing scale
- Automatic content overflow handling

### Accessibility

- Full keyboard navigation support
- ARIA labels and descriptions
- Screen reader compatibility
- Focus management and indicators
- High contrast support

### Performance

- Lazy loading support for content sections
- Optimized re-renders with React.memo
- Smooth transitions and animations
- Minimal bundle size impact

## Customization

### Theming

Components use CSS custom properties for theming:

```css
:root {
  --admin-bg: #f8fafc;
  --admin-card-bg: rgba(255, 255, 255, 0.9);
  --admin-border: rgba(15, 23, 42, 0.1);
  --admin-text: #0f172a;
  --admin-text-muted: #64748b;
}
```

### Layout Configuration

Customize layout behavior through props:

```tsx
const layoutConfig = {
  showSidebar: true,
  showBreadcrumb: true,
  maxWidth: '7xl', // 'full' | '7xl' | '6xl'
  padding: 'md', // 'sm' | 'md' | 'lg'
};
```

## Migration from Monolithic Admin.tsx

1. **Extract Header**: Move header logic to AdminHeader component
2. **Extract Sidebar**: Convert tab navigation to AdminSidebar
3. **Extract Content**: Wrap content sections in AdminLayout
4. **Add Breadcrumbs**: Implement AdminBreadcrumb for navigation context
5. **Update State**: Centralize navigation state management
6. **Test Integration**: Verify all functionality works with new structure

## Requirements Satisfied

This implementation satisfies the following requirements:

- **1.1**: Component architecture optimization - Split into focused components
- **2.1**: Enhanced layout with responsive grid system
- **2.2**: Proper responsive design across screen sizes
- **6.1**: Well-organized file structure for admin components

## Testing

Run the test suite to verify component functionality:

```bash
npm test src/components/admin/layout/__tests__/
```

The test suite covers:

- Component rendering
- User interactions
- Responsive behavior
- Integration scenarios
- Accessibility features
