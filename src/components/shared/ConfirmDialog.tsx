import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  Trash2,
  Save,
  LogOut,
  Archive,
  Send,
  Download,
  Upload,
  RefreshCw,
  X,
  Check,
  Info,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ConfirmDialogVariant =
  | 'destructive'
  | 'default'
  | 'warning'
  | 'info'
  | 'success';

export type ConfirmDialogIcon =
  | 'alert'
  | 'delete'
  | 'save'
  | 'logout'
  | 'archive'
  | 'send'
  | 'download'
  | 'upload'
  | 'refresh'
  | 'cancel'
  | 'check'
  | 'info'
  | 'help'
  | React.ReactNode;

export interface ConfirmDialogProps {
  // Core dialog props
  open?: boolean;
  onOpenChange?: (open: boolean) => void;

  // Content
  title: string;
  description: string;

  // Actions
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;

  // Customization
  variant?: ConfirmDialogVariant;
  icon?: ConfirmDialogIcon;
  confirmLabel?: string;
  cancelLabel?: string;

  // Trigger (optional)
  trigger?: React.ReactNode;

  // Loading state
  loading?: boolean;

  // Additional options
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';

  // Accessibility
  className?: string;
}

const variantStyles = {
  destructive: {
    icon: 'delete' as ConfirmDialogIcon,
    confirmButtonVariant: 'destructive' as const,
    iconColor: 'text-destructive',
    titleColor: 'text-destructive',
  },
  warning: {
    icon: 'alert' as ConfirmDialogIcon,
    confirmButtonVariant: 'default' as const,
    iconColor: 'text-yellow-500',
    titleColor: 'text-yellow-600',
  },
  info: {
    icon: 'info' as ConfirmDialogIcon,
    confirmButtonVariant: 'default' as const,
    iconColor: 'text-blue-500',
    titleColor: 'text-blue-600',
  },
  success: {
    icon: 'check' as ConfirmDialogIcon,
    confirmButtonVariant: 'default' as const,
    iconColor: 'text-green-500',
    titleColor: 'text-green-600',
  },
  default: {
    icon: 'help' as ConfirmDialogIcon,
    confirmButtonVariant: 'default' as const,
    iconColor: 'text-muted-foreground',
    titleColor: 'text-foreground',
  },
};

const iconMap = {
  alert: AlertTriangle,
  delete: Trash2,
  save: Save,
  logout: LogOut,
  archive: Archive,
  send: Send,
  download: Download,
  upload: Upload,
  refresh: RefreshCw,
  cancel: X,
  check: Check,
  info: Info,
  help: HelpCircle,
};

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  variant = 'default',
  icon,
  confirmLabel,
  cancelLabel = 'Cancel',
  trigger,
  loading = false,
  showIcon = true,
  size = 'md',
  className,
}) => {
  const variantConfig = variantStyles[variant];
  const displayIcon = icon || variantConfig.icon;
  const displayConfirmLabel = confirmLabel || getDefaultConfirmLabel(variant);

  const renderIcon = () => {
    if (!showIcon) return null;

    if (React.isValidElement(displayIcon)) {
      return displayIcon;
    }

    if (
      typeof displayIcon === 'string' &&
      iconMap[displayIcon as keyof typeof iconMap]
    ) {
      const IconComponent = iconMap[displayIcon as keyof typeof iconMap];
      return (
        <IconComponent className={cn('h-6 w-6', variantConfig.iconColor)} />
      );
    }

    return null;
  };

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Error in confirm action:', error);
    }
  };

  const content = (
    <AlertDialogContent className={cn(sizeClasses[size], className)}>
      <AlertDialogHeader>
        <AlertDialogTitle
          className={cn('flex items-center gap-3', variantConfig.titleColor)}
        >
          {renderIcon()}
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-left">
          {description}
        </AlertDialogDescription>
      </AlertDialogHeader>

      <AlertDialogFooter>
        <AlertDialogCancel onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </AlertDialogCancel>
        <AlertDialogAction
          onClick={handleConfirm}
          className={cn(
            variantConfig.confirmButtonVariant === 'destructive' &&
              'bg-destructive text-destructive-foreground hover:bg-destructive/90'
          )}
          disabled={loading}
        >
          {loading && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {displayConfirmLabel}
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  );

  if (trigger) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
        {content}
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      {content}
    </AlertDialog>
  );
};

function getDefaultConfirmLabel(variant: ConfirmDialogVariant): string {
  switch (variant) {
    case 'destructive':
      return 'Delete';
    case 'warning':
      return 'Continue';
    case 'info':
      return 'OK';
    case 'success':
      return 'Confirm';
    default:
      return 'Confirm';
  }
}

// Convenience components for common scenarios
export const DeleteConfirmDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  itemName?: string;
  itemType?: string;
  trigger?: React.ReactNode;
  loading?: boolean;
}> = ({ itemName = 'this item', itemType = 'item', onConfirm, ...props }) => (
  <ConfirmDialog
    variant="destructive"
    title={`Delete ${itemType}`}
    description={`Are you sure you want to delete ${itemName}? This action cannot be undone.`}
    confirmLabel="Delete"
    onConfirm={onConfirm}
    {...props}
  />
);

export const SaveConfirmDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  loading?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({ hasUnsavedChanges = true, onConfirm, ...props }) => (
  <ConfirmDialog
    variant="warning"
    icon="save"
    title="Save changes"
    description={
      hasUnsavedChanges
        ? 'You have unsaved changes. Do you want to save them before continuing?'
        : 'Do you want to save your changes?'
    }
    confirmLabel="Save"
    onConfirm={onConfirm}
    {...props}
  />
);

export const LogoutConfirmDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  loading?: boolean;
}> = ({ onConfirm, ...props }) => (
  <ConfirmDialog
    variant="warning"
    icon="logout"
    title="Sign out"
    description="Are you sure you want to sign out? You'll need to sign in again to access your account."
    confirmLabel="Sign Out"
    onConfirm={onConfirm}
    {...props}
  />
);

export const ArchiveConfirmDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  itemName?: string;
  itemType?: string;
  trigger?: React.ReactNode;
  loading?: boolean;
}> = ({ itemName = 'this item', itemType = 'item', onConfirm, ...props }) => (
  <ConfirmDialog
    variant="warning"
    icon="archive"
    title={`Archive ${itemType}`}
    description={`Are you sure you want to archive ${itemName}? You can restore it later from the archive.`}
    confirmLabel="Archive"
    onConfirm={onConfirm}
    {...props}
  />
);

export const RefreshConfirmDialog: React.FC<{
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
  onCancel?: () => void;
  trigger?: React.ReactNode;
  loading?: boolean;
  hasUnsavedChanges?: boolean;
}> = ({ hasUnsavedChanges = false, onConfirm, ...props }) => (
  <ConfirmDialog
    variant="warning"
    icon="refresh"
    title="Refresh page"
    description={
      hasUnsavedChanges
        ? 'Refreshing will lose any unsaved changes. Are you sure you want to continue?'
        : 'Are you sure you want to refresh the page?'
    }
    confirmLabel="Refresh"
    onConfirm={onConfirm}
    {...props}
  />
);

export default ConfirmDialog;
