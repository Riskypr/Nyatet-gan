import React from 'react';
import { cn } from '@/lib/utils/cn';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', isLoading = false, disabled, children, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none cursor-pointer';

    const variants = {
      primary:
        'bg-primary hover:opacity-90 text-white shadow-xs shadow-primary/25 focus:ring-primary',
      secondary:
        'bg-surface-alt hover:bg-border/50 text-text-primary border border-border focus:ring-primary',
      success:
        'bg-secondary hover:opacity-90 text-white shadow-xs focus:ring-secondary',
      danger:
        'bg-danger hover:opacity-90 text-white shadow-xs focus:ring-danger',
      ghost:
        'bg-transparent hover:bg-surface-alt text-text-primary focus:ring-primary',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 h-8',
      md: 'text-sm px-4 py-2.5 gap-2 h-10',
      lg: 'text-base px-6 py-3 gap-2.5 h-12 font-semibold',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
