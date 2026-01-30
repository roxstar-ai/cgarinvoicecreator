import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
              variant === 'default',
            'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600':
              variant === 'destructive',
            'border border-gray-300 bg-white text-gray-800 hover:bg-gray-50 focus-visible:ring-gray-400':
              variant === 'outline',
            'hover:bg-gray-100 focus-visible:ring-gray-400': variant === 'ghost',
            'text-blue-900 underline-offset-4 hover:underline':
              variant === 'link',
            'bg-blue-900 text-white hover:bg-blue-800 focus-visible:ring-blue-900':
              variant === 'secondary',
          },
          {
            'h-10 px-4 py-2': size === 'default',
            'h-9 rounded-md px-3': size === 'sm',
            'h-11 rounded-md px-8': size === 'lg',
            'h-10 w-10': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
