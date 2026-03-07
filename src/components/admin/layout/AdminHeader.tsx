import React from 'react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme';
import { ProfessionalSignature } from '@/components/ui/signature';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface User {
  uid: string;
  email: string | null;
  displayName?: string | null;
}

interface HeaderAction {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'ghost';
}

interface AdminHeaderProps {
  user: User | null;
  onLogout: () => void;
  showUserMenu?: boolean;
  actions?: HeaderAction[];
  className?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  user,
  onLogout,
  showUserMenu = true,
  actions = [],
  className,
}) => {
  return (
    <div
      className={cn(
        'glass sticky top-0 z-50 border-b border-border/30',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="group relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative rounded-full bg-white/10 p-1.5 backdrop-blur-sm dark:bg-gray-800/10 sm:p-2">
                <img
                  src="/mounir-icon.svg"
                  alt="Admin"
                  className="h-7 w-7 transition-transform duration-300 group-hover:scale-110 sm:h-8 sm:w-8"
                />
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-xl font-bold text-transparent sm:text-2xl">
                Portfolio Admin
              </h1>
              <p className="hidden text-xs text-muted-foreground sm:block sm:text-sm">
                Content Management System
              </p>
            </div>
          </div>

          {/* Actions and User Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                size="sm"
                className="hover-lift glass hover:glow-primary hidden border-border/30 sm:flex"
              >
                <action.icon className="mr-2 h-4 w-4" />
                {action.label}
              </Button>
            ))}

            {/* Mobile view actions */}
            {actions.map((action, index) => (
              <Button
                key={`mobile-${index}`}
                variant={action.variant || 'outline'}
                onClick={action.onClick}
                size="sm"
                className="hover-lift glass hover:glow-primary border-border/30 sm:hidden"
              >
                <action.icon className="h-4 w-4" />
                <span className="sr-only">{action.label}</span>
              </Button>
            ))}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Professional Signature */}
            <div className="hidden lg:block">
              <ProfessionalSignature />
            </div>

            {/* User Menu */}
            {showUserMenu && user && (
              <Button
                variant="outline"
                onClick={onLogout}
                size="sm"
                className="hover-lift glass hover:glow-primary hidden border-border/30 md:flex"
              >
                <Settings className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            )}

            {/* Mobile user menu */}
            {showUserMenu && user && (
              <Button
                variant="outline"
                onClick={onLogout}
                size="sm"
                className="hover-lift glass hover:glow-primary border-border/30 md:hidden"
              >
                <Settings className="h-4 w-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminHeader;
