import React from 'react';
import {
  FileX,
  Search,
  Plus,
  RefreshCw,
  Database,
  Users,
  FolderOpen,
  AlertCircle,
  Filter,
  Inbox,
  Settings,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export type EmptyStateVariant =
  | 'no-data'
  | 'no-results'
  | 'no-items'
  | 'no-content'
  | 'error'
  | 'empty-search'
  | 'empty-filter'
  | 'empty-folder'
  | 'empty-inbox'
  | 'completed-tasks'
  | 'no-connection';

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?:
    | 'default'
    | 'outline'
    | 'destructive'
    | 'secondary'
    | 'ghost'
    | 'link';
  icon?: React.ReactNode;
}

export interface EmptyStateProps {
  variant?: EmptyStateVariant;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: EmptyStateAction[];
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCard?: boolean;
}

const defaultConfigs = {
  'no-data': {
    icon: <Database className="h-12 w-12 text-muted-foreground" />,
    title: 'No data available',
    description:
      "There's no data to display at the moment. Try refreshing or adding some content.",
  },
  'no-results': {
    icon: <Search className="h-12 w-12 text-muted-foreground" />,
    title: 'No results found',
    description:
      "We couldn't find anything matching your search. Try adjusting your search terms.",
  },
  'no-items': {
    icon: <FileX className="h-12 w-12 text-muted-foreground" />,
    title: 'No items found',
    description:
      "You haven't added any items yet. Get started by creating your first item.",
  },
  'no-content': {
    icon: <FolderOpen className="h-12 w-12 text-muted-foreground" />,
    title: 'No content available',
    description: 'This section is empty. Add some content to get started.',
  },
  error: {
    icon: <AlertCircle className="h-12 w-12 text-destructive" />,
    title: 'Something went wrong',
    description:
      'We encountered an error while loading the data. Please try again.',
  },
  'empty-search': {
    icon: <Search className="h-12 w-12 text-muted-foreground" />,
    title: 'Start searching',
    description: "Enter a search term to find what you're looking for.",
  },
  'empty-filter': {
    icon: <Filter className="h-12 w-12 text-muted-foreground" />,
    title: 'No matches for current filters',
    description: 'Try adjusting or clearing your filters to see more results.',
  },
  'empty-folder': {
    icon: <FolderOpen className="h-12 w-12 text-muted-foreground" />,
    title: 'This folder is empty',
    description:
      'Start by adding files or creating new content in this folder.',
  },
  'empty-inbox': {
    icon: <Inbox className="h-12 w-12 text-muted-foreground" />,
    title: 'Your inbox is empty',
    description: 'All caught up! You have no new notifications or messages.',
  },
  'completed-tasks': {
    icon: <CheckCircle className="h-12 w-12 text-green-500" />,
    title: 'All tasks completed!',
    description:
      "Great job! You've completed all your tasks. Take a well-deserved break.",
  },
  'no-connection': {
    icon: <AlertCircle className="h-12 w-12 text-orange-500" />,
    title: 'No internet connection',
    description: 'Please check your connection and try again.',
  },
};

const sizeClasses = {
  sm: 'p-4 space-y-2',
  md: 'p-8 space-y-4',
  lg: 'p-12 space-y-6',
};

export const EmptyStates: React.FC<EmptyStateProps> = ({
  variant = 'no-data',
  title,
  description,
  icon,
  actions = [],
  className,
  size = 'md',
  showCard = false,
}) => {
  const config = defaultConfigs[variant];
  const displayTitle = title || config.title;
  const displayDescription = description || config.description;
  const displayIcon = icon || config.icon;

  const content = (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizeClasses[size],
        className
      )}
    >
      {displayIcon}

      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-foreground">
          {displayTitle}
        </h3>

        <p className="max-w-md text-sm text-muted-foreground">
          {displayDescription}
        </p>
      </div>

      {actions.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant || 'default'}
              onClick={action.onClick}
              className="flex items-center gap-2"
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );

  if (showCard) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-0">{content}</CardContent>
      </Card>
    );
  }

  return content;
};

// Convenience components for common scenarios
export const NoDataState: React.FC<{
  onRefresh?: () => void;
  onAdd?: () => void;
  addLabel?: string;
}> = ({ onRefresh, onAdd, addLabel = 'Add Item' }) => {
  const actions: EmptyStateAction[] = [];

  if (onRefresh) {
    actions.push({
      label: 'Refresh',
      onClick: onRefresh,
      variant: 'outline',
      icon: <RefreshCw className="h-4 w-4" />,
    });
  }

  if (onAdd) {
    actions.push({
      label: addLabel,
      onClick: onAdd,
      icon: <Plus className="h-4 w-4" />,
    });
  }

  return <EmptyStates variant="no-data" actions={actions} />;
};

export const NoSearchResultsState: React.FC<{
  onClearSearch?: () => void;
  searchTerm?: string;
}> = ({ onClearSearch, searchTerm }) => {
  const actions: EmptyStateAction[] = [];

  if (onClearSearch) {
    actions.push({
      label: 'Clear Search',
      onClick: onClearSearch,
      variant: 'outline',
    });
  }

  return (
    <EmptyStates
      variant="no-results"
      description={
        searchTerm
          ? `No results found for "${searchTerm}". Try different search terms.`
          : "We couldn't find anything matching your search. Try adjusting your search terms."
      }
      actions={actions}
    />
  );
};

export const ErrorState: React.FC<{
  onRetry?: () => void;
  error?: string;
}> = ({ onRetry, error }) => {
  const actions: EmptyStateAction[] = [];

  if (onRetry) {
    actions.push({
      label: 'Try Again',
      onClick: onRetry,
      icon: <RefreshCw className="h-4 w-4" />,
    });
  }

  return (
    <EmptyStates
      variant="error"
      description={
        error ||
        'We encountered an error while loading the data. Please try again.'
      }
      actions={actions}
    />
  );
};

export const NoFilterResultsState: React.FC<{
  onClearFilters?: () => void;
}> = ({ onClearFilters }) => {
  const actions: EmptyStateAction[] = [];

  if (onClearFilters) {
    actions.push({
      label: 'Clear Filters',
      onClick: onClearFilters,
      variant: 'outline',
      icon: <Filter className="h-4 w-4" />,
    });
  }

  return <EmptyStates variant="empty-filter" actions={actions} />;
};

export const EmptyFolderState: React.FC<{
  onAddFile?: () => void;
  onCreateFolder?: () => void;
}> = ({ onAddFile, onCreateFolder }) => {
  const actions: EmptyStateAction[] = [];

  if (onAddFile) {
    actions.push({
      label: 'Add File',
      onClick: onAddFile,
      icon: <Plus className="h-4 w-4" />,
    });
  }

  if (onCreateFolder) {
    actions.push({
      label: 'Create Folder',
      onClick: onCreateFolder,
      variant: 'outline',
      icon: <FolderOpen className="h-4 w-4" />,
    });
  }

  return <EmptyStates variant="empty-folder" actions={actions} />;
};

export default EmptyStates;
