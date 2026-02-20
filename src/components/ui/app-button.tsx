'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      children,
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      leftIcon,
      rightIcon,
      asChild = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-dark text-white border-2 border-dark hover:bg-white hover:text-dark active:scale-[0.98]',
      secondary:
        'bg-cream border-2 border-dark/10 text-dark hover:border-dark hover:bg-white active:scale-[0.98]',
      outline:
        'border-2 border-dark/20 text-dark hover:border-dark hover:bg-dark hover:text-white active:scale-[0.98]',
      ghost:
        'text-dark/60 hover:text-dark hover:bg-cream active:scale-[0.98]',
      danger:
        'bg-error text-white border-2 border-error hover:bg-white hover:text-error active:scale-[0.98]',
    };

    const sizes = {
      sm: 'text-[10px] px-4 py-2 gap-2 uppercase tracking-widest font-bold rounded-xl',
      md: 'text-xs px-6 py-3 gap-2 uppercase tracking-widest font-bold rounded-xl',
      lg: 'text-sm px-8 py-4 gap-2.5 uppercase tracking-widest font-bold rounded-xl',
    };

    const content = loading ? (
      <Loader2 className="w-5 h-5 animate-spin" />
    ) : (
      <>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </>
    );

    if (asChild) {
      return (
        <span
          style={{ transition: 'var(--transition-elegant)' }}
          className={cn(
            baseStyles,
            variants[variant],
            sizes[size],
            fullWidth && 'w-full',
            className
          )}
        >
          {content}
        </span>
      );
    }

    return (
      <button
        ref={ref}
        style={{ transition: 'var(--transition-elegant)' }}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {content}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
