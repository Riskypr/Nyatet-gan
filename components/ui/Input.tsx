import React from 'react';
import { cn } from '@/lib/utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs font-semibold text-text-primary tracking-wide">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full h-11 px-3.5 py-2 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted',
            'focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all text-sm',
            error && 'border-danger focus:ring-danger/20 focus:border-danger',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-danger font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
