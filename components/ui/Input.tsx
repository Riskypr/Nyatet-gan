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
          <label htmlFor={inputId} className="text-xs font-semibold text-[#2D2A26] tracking-wide">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            'w-full h-11 px-3.5 py-2 rounded-xl bg-white border border-[#E5DCD0] text-[#2D2A26] placeholder-[#9E968B]',
            'focus:outline-none focus:ring-2 focus:ring-[#C86446]/30 focus:border-[#C86446] transition-all text-sm',
            error && 'border-[#B0473C] focus:ring-[#B0473C]/20 focus:border-[#B0473C]',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-[#B0473C] font-medium">{error}</p>}
        {helperText && !error && <p className="text-xs text-[#68635B]">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
