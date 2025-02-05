import { Slot } from '@radix-ui/react-slot'
import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'
import { cn } from '../../common/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md focus-visible:border-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 gap-3 transition duration-75 cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-button-background text-button-foreground hover:bg-button-background-hover focus-visible:bg-primary-hover',
        outline:
          'border border-border bg-background hover:bg-muted hover:text-foreground',
        secondary:
          'bg-button-secondary-background text-button-secondary-foreground hover:bg-button-secondary-background-hover disabled:opacity-75',
        text: 'text-muted-foreground hover:text-button-secondary-foreground',
        link: 'text-link underline-offset-4 hover:underline hover:text-link-hover'
      },

      size: {
        default: 'px-4 py-2',
        xs: 'rounded-md px-2 py-1 text-xs gap-1',
        sm: 'rounded-md px-2 py-1',
        lg: 'rounded-md px-8',
        icon: 'rounded-lg size-[1.375rem] gap-1', // Match VS Code’s 22px icon buttons
        none: 'p-0'
      },

      active: {
        none: '',
        active:
          'bg-button-secondary-background-hover text-button-secondary-foreground opacity-80 hover:opacity-100'
      }
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      active: 'none'
    }
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, active, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, active, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button, buttonVariants }
