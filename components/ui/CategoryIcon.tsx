import React from 'react';
import {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Award,
  Gift,
  TrendingUp,
  Coins,
  Wallet,
  Tag,
  CreditCard,
  Smartphone,
  Briefcase,
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const iconMap: Record<string, LucideIcon> = {
  Utensils,
  Car,
  ShoppingBag,
  Receipt,
  Film,
  HeartPulse,
  GraduationCap,
  MoreHorizontal,
  Banknote,
  Award,
  Gift,
  TrendingUp,
  Coins,
  Wallet,
  CreditCard,
  Smartphone,
  Briefcase,
  Tag,
};

export interface CategoryIconProps {
  name: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CategoryIcon({ name, color = '#C86446', size = 'md', className }: CategoryIconProps) {
  const IconComponent = iconMap[name] || Tag;

  const sizeStyles = {
    sm: 'w-7 h-7 p-1.5 text-xs',
    md: 'w-10 h-10 p-2.5 text-sm',
    lg: 'w-12 h-12 p-3 text-base',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  return (
    <div
      className={cn('rounded-xl flex items-center justify-center shrink-0 transition-transform', sizeStyles[size], className)}
      style={{
        backgroundColor: `${color}1A`, // ~10% opacity
        color: color,
      }}
    >
      <IconComponent className={iconSizes[size]} />
    </div>
  );
}
