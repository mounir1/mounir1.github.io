import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusStyles = {
    planning: 'bg-blue-500',
    'in-progress': 'bg-yellow-500',
    completed: 'bg-green-500',
    'on-hold': 'bg-gray-500',
    cancelled: 'bg-red-500',
  };

  return (
    <Badge
      className={cn(
        'text-white',
        statusStyles[status as keyof typeof statusStyles] || 'bg-gray-500'
      )}
    >
      {status.replace(/-/g, ' ')}
    </Badge>
  );
};
