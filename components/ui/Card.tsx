import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'flat' | 'outline';
}

export function Card({ className, variant = 'elevated', children, ...props }: CardProps) {
  const variants = {
    elevated:
      'bg-white border border-[#E5DCD0]/80 shadow-sm shadow-[#2D2A26]/8',
    flat:
      'bg-[#F2ECE1]/70 border border-transparent',
    outline:
      'bg-transparent border border-[#E5DCD0]',
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
