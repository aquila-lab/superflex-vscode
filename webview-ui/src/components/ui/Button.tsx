import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { type VariantProps, cva } from 'class-variance-authority';
import { cn } from '../../common/utils';

const roundedIconStyles = 'flex items-center justify-center !rounded-full !p-2 border';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:border-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-3 transition duration-75 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-button-background text-button-foreground hover:bg-button-background-hover focus-visible:bg-primary-hover',
        outline: 'border border-border bg-background hover:bg-muted hover:text-foreground',
        secondary:
          'bg-button-secondary-background text-button-secondary-foreground hover:bg-button-secondary-background-hover disabled:opacity-75',
        ghost: 'hover:bg-muted-transparent',
        text: 'text-foreground bg-transparent items-end border-none transition-all items-center px-0 w-full text-left',
        link: 'text-link underline-offset-4 hover:underline hover:text-link-hover',
        primaryRoundedIcon: `${roundedIconStyles} border border-button-border bg-button-background text-button-foreground hover:bg-button-background-hover disabled:bg-current-25 disabled:text-current`,
        outlineRoundedIcon: `${roundedIconStyles} border border-border`,
        ghostRoundedIcon: `${roundedIconStyles} border-transparent`
      },

      size: {
        default: 'px-4 py-2',
        xs: 'rounded-sm px-2 text-xs',
        sm: 'rounded-md px-2 py-[.1rem]',
        lg: 'rounded-md px-8',
        icon: 'rounded-lg w-[1.375rem] h-[1.375rem]', // Match VS Code’s 22px icon buttons
        none: 'p-0'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default'
    }
  }
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  }
);

Button.displayName = 'Button';

export { Button, buttonVariants };
