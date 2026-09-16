import React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

    const variants = {
      primary: 'bg-primary text-white hover:bg-primary-dark shadow-[0_4px_12px_rgba(124,92,252,0.25)]',
      secondary: 'bg-primary-fixed text-primary hover:bg-primary-fixed/80',
      ghost: 'bg-transparent text-text-secondary hover:bg-page-background hover:text-text-primary',
      danger: 'bg-semantic-urgent-tint text-semantic-urgent hover:bg-semantic-urgent hover:text-white',
      outline: 'bg-transparent border border-border-subtle text-text-primary hover:bg-page-background',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
