# Admin Authentication Components

This directory contains the authentication components for the admin dashboard, extracted from the monolithic Admin.tsx component.

## Components

### AdminAuth

The main authentication wrapper component that provides authentication context and guards admin routes.

```tsx
import { AdminAuth } from '@/components/admin/auth';

function App() {
  return (
    <AdminAuth>
      <AdminDashboard />
    </AdminAuth>
  );
}
```

### LoginForm

A standalone login form component with Firebase authentication integration.

```tsx
import { LoginForm } from '@/components/admin/auth';

function LoginPage() {
  return <LoginForm onSuccess={() => console.log('Login successful')} />;
}
```

### AuthGuard

A route protection component that shows login form for unauthenticated users.

```tsx
import { AuthGuard } from '@/components/admin/auth';

function ProtectedRoute() {
  return (
    <AuthGuard>
      <AdminContent />
    </AuthGuard>
  );
}
```

## Hook

### useAdminAuth

A custom hook that provides authentication state and methods.

```tsx
import { useAdminAuth } from '@/hooks/useAdminAuth';

function MyComponent() {
  const {
    user,
    loading,
    error,
    isAuthenticated,
    canUseAdmin,
    login,
    logout,
    clearError,
  } = useAdminAuth();

  // Use authentication state and methods
}
```

## Features

- **Firebase Integration**: Uses Firebase Authentication for secure login/logout
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Loading States**: Proper loading indicators during authentication operations
- **Route Protection**: Automatic redirection to login for unauthenticated users
- **Configuration Check**: Validates Firebase configuration before allowing access
- **Responsive Design**: Mobile-friendly login interface with animated backgrounds

## Requirements Satisfied

- **1.2**: Component decomposition - Authentication logic extracted from monolithic component
- **4.2**: Modular structure - Reusable authentication components with proper separation of concerns
- **7.1**: State management - Centralized authentication state with custom hook

## Usage Example

```tsx
import { AdminAuth } from '@/components/admin/auth';
import { AdminLayout } from '@/components/admin/layout';

export default function Admin() {
  return (
    <AdminAuth>
      <AdminLayout>{/* Your admin content here */}</AdminLayout>
    </AdminAuth>
  );
}
```

## Testing

The components include unit tests to verify:

- Hook initialization and state management
- Authentication flow
- Error handling
- Component rendering

Run tests with:

```bash
npm test src/components/admin/auth
```
