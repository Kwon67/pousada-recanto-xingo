'use client';

import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'dark';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'primary',
  size = 'md',
  className,
}: BadgeProps) {
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/20 text-secondary-dark',
    accent: 'bg-accent/10 text-accent',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    error: 'bg-error/10 text-error',
    dark: 'bg-dark text-white',
  };

  const sizes = {
    sm: 'text-[10px] px-2 py-0.5 uppercase tracking-widest font-bold',
    md: 'text-xs px-3 py-1 uppercase tracking-widest font-bold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-none',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
}
