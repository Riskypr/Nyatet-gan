import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'neutral';
}

export function Badge({ className, variant = 'neutral', children, ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-[#A8562D]/15 text-[#7C3F20] border border-[#A8562D]/25',
    secondary: 'bg-[#6B7C5A]/15 text-[#425036] border border-[#6B7C5A]/25',
    success: 'bg-[#6B7C5A]/15 text-[#425036] border border-[#6B7C5A]/25',
    danger: 'bg-[#B0473C]/15 text-[#8F3930] border border-[#B0473C]/25',
    warning: 'bg-[#C98A3A]/15 text-[#855519] border border-[#C98A3A]/25',
    neutral: 'bg-[#F0E6D8] text-[#7A6B5C] border border-[#E3D5C3]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium select-none',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
