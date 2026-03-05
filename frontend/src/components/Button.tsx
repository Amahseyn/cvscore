import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'white';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, children, ...props }, ref) => {
        const variants = {
            primary: 'bg-brand-600 text-white hover:bg-brand-500 hover:shadow-brand-500/40 shadow-xl shadow-brand-600/20 active:scale-[0.98] ring-offset-2 focus-visible:ring-2 focus-visible:ring-brand-500',
            secondary: 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-[0.98] ring-offset-2 focus-visible:ring-2 focus-visible:ring-slate-500',
            outline: 'border border-slate-200 dark:border-slate-800 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-brand-500 hover:text-brand-600 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500',
            ghost: 'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-slate-500',
            white: 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-md active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-brand-500',
        };

        const sizes = {
            sm: 'px-4 py-2 text-[10px] rounded-xl',
            md: 'px-6 py-3.5 text-[10px] rounded-2xl',
            lg: 'px-8 py-4 text-xs rounded-2xl',
            xl: 'px-12 py-6 text-xs rounded-3xl',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center font-black uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none outline-none',
                    variants[variant as keyof typeof variants],
                    sizes[size],
                    className
                )}
                disabled={isLoading}
                {...props}
            >
                {isLoading ? (
                    <span className="mr-3 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : null}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
