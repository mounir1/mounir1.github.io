import React from 'react';

// Minimal app for debugging the React hook issue
export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Debug App - Testing React Hooks
        </h1>
        <p className="mt-4 text-gray-600 dark:text-gray-300">
          If you can see this, React is working fine.
        </p>
      </div>
    </div>
  );
}
