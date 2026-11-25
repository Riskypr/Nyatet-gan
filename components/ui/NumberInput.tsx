import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils/cn';
import { formatThousands, parseRupiahInput } from '@/lib/utils/currency';

export interface NumberInputProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  placeholder?: string;
  error?: string;
  helperText?: string;
  className?: string;
  id?: string;
  prefix?: string;
  autoFocus?: boolean;
  /** 'hero': tampilan nominal besar tanpa border (untuk form transaksi). Default: 'default' */
  variant?: 'default' | 'hero';
}

export function NumberInput({
  label,
  value,
  onChange,
  placeholder = '0',
  error,
  helperText,
  className,
  id,
  prefix = 'Rp',
  autoFocus = false,
  variant = 'default',
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(
    value > 0 ? formatThousands(value) : ''
  );

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatThousands(value));
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const num = parseRupiahInput(raw);
    setDisplayValue(raw === '' ? '' : formatThousands(num));
    onChange(num);
  };

  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  /* ── HERO VARIANT ─────────────────────────────────────── */
  if (variant === 'hero') {
    return (
      <div className={cn('w-full flex flex-col items-center gap-2 py-4', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[11px] font-bold tracking-widest uppercase text-primary cursor-pointer"
          >
            {label}
          </label>
        )}
        <div className="flex items-baseline gap-1 w-full justify-center">
          {prefix && (
            <span className="text-3xl font-extrabold text-text-primary">{prefix}</span>
          )}
          <input
            id={inputId}
            type="text"
            inputMode="numeric"
            autoFocus={autoFocus}
            value={displayValue}
            onChange={handleChange}
            placeholder="0"
            className={cn(
              'bg-transparent border-none outline-none text-4xl font-extrabold text-text-primary',
              'text-center placeholder-text-muted/50 caret-primary',
              'min-w-0 w-auto max-w-[220px]',
            )}
            style={{ width: `${Math.max(3, (displayValue || '0').length + 1)}ch` }}
          />
        </div>
        {error && <p className="text-xs text-danger font-medium text-center">{error}</p>}
        {helperText && !error && (
          <p className="text-xs text-text-secondary text-center">{helperText}</p>
        )}
      </div>
    );
  }

  /* ── DEFAULT VARIANT ──────────────────────────────────── */
  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-text-primary tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-sm font-semibold text-text-secondary pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoFocus={autoFocus}
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            'w-full h-12 rounded-xl bg-surface border border-border text-text-primary placeholder-text-muted',
            prefix ? 'pl-11 pr-3.5' : 'px-3.5',
            'font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary transition-all',
            error && 'border-danger focus:ring-danger/20 focus:border-danger',
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-danger font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-text-secondary">{helperText}</p>}
    </div>
  );
}
