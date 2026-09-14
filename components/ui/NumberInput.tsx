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
}: NumberInputProps) {
  const [displayValue, setDisplayValue] = useState<string>(
    value > 0 ? formatThousands(value) : ''
  );

  useEffect(() => {
    if (value > 0) {
      setDisplayValue(formatThousands(value));
    } else if (value === 0 && displayValue !== '') {
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

  return (
    <div className="w-full flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-[#2D2A26] tracking-wide">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3.5 text-sm font-semibold text-[#68635B] pointer-events-none select-none">
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
            'w-full h-12 rounded-xl bg-white border border-[#E5DCD0] text-[#2D2A26] placeholder-[#9E968B]',
            prefix ? 'pl-11 pr-3.5' : 'px-3.5',
            'font-semibold text-lg focus:outline-none focus:ring-2 focus:ring-[#C86446]/30 focus:border-[#C86446] transition-all',
            error && 'border-[#B0473C] focus:ring-[#B0473C]/20 focus:border-[#B0473C]',
            className
          )}
        />
      </div>
      {error && <p className="text-xs text-[#B0473C] font-medium">{error}</p>}
      {helperText && !error && <p className="text-xs text-[#68635B]">{helperText}</p>}
    </div>
  );
}
