import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outline';
}

export function Card({ className, variant = 'elevated', children, ...props }: CardProps) {
  const variants = {
    elevated:
      'bg-surface border border-border/80 shadow-xs shadow-black/5 dark:shadow-black/25',
    flat:
      'bg-surface-alt/80 border border-transparent',
    outline:
      'bg-transparent border border-border',
  };

  return (
    <div
      className={cn('rounded-2xl p-4 transition-all duration-150', variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
}
