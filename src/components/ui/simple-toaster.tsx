import React from 'react';

// Minimal Toaster component that doesn't cause React hook issues
export function SimpleToaster() {
  return <div id="toast-container" className="fixed right-4 top-4 z-50" />;
}

export const Toaster = SimpleToaster;
