import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-primary/15 text-primary border border-primary/25',
    secondary: 'bg-secondary/15 text-secondary border border-secondary/25',
    success: 'bg-secondary/15 text-secondary border border-secondary/25',
    danger: 'bg-danger/15 text-danger border border-danger/25',
    warning: 'bg-warning/15 text-warning border border-warning/25',
    neutral: 'bg-surface-alt text-text-secondary border border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold select-none transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
