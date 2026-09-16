import React from 'react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div className={cn('flex flex-col items-center justify-center py-12 px-4 text-center', className)}>
      {icon && (
        <div className="w-14 h-14 rounded-2xl bg-page-background text-primary flex items-center justify-center mb-3 shadow-xs">
          {icon}
        </div>
      )}
      <h3 className="font-display font-bold text-base text-text-primary">{title}</h3>
      {description && <p className="text-xs text-text-secondary max-w-xs mt-1">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
};
