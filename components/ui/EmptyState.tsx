import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { Button } from './Button';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-border bg-surface-alt/50 transition-colors',
        className
      )}
    >
      <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center text-primary mb-3 shadow-xs">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-text-primary">{title}</h3>
      <p className="text-xs text-text-secondary max-w-xs mt-1 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" variant="primary" onClick={onAction} className="mt-4 shadow-xs">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
