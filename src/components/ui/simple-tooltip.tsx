import React, { ReactNode } from 'react';

interface TooltipProviderProps {
  children: ReactNode;
}

// Simple tooltip provider that doesn't use Radix UI
export function SimpleTooltipProvider({ children }: TooltipProviderProps) {
  return <>{children}</>;
}

export const TooltipProvider = SimpleTooltipProvider;
