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
      'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-[#C86446] hover:bg-[#A84D32] text-white shadow-sm shadow-[#2D2A26]/15 focus:ring-[#C86446]',
      secondary:
        'bg-[#F2ECE1] hover:bg-[#E5DCD0] text-[#2D2A26] border border-[#E5DCD0] focus:ring-[#C86446]',
      success:
        'bg-[#4A6B53] hover:bg-[#38523F] text-white shadow-sm shadow-[#2D2A26]/15 focus:ring-[#4A6B53]',
      danger:
        'bg-[#B0473C] hover:bg-[#8F3930] text-white shadow-sm shadow-[#2D2A26]/15 focus:ring-[#B0473C]',
      ghost:
        'bg-transparent hover:bg-[#F2ECE1]/70 text-[#2D2A26] focus:ring-[#C86446]',
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
