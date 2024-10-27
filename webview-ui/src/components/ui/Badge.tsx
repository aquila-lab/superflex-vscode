import React from 'react';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../common/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-[6px] px-[5px] py-0 text-xs focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        secondary: 'bg-badge-background text-badge-foreground',
        outline: 'border border-muted-transparent bg-[unset] text-muted-foreground',
        destructive: 'bg-destructive-background text-destructive-foreground'
      }
    },
    defaultVariants: {
      variant: 'secondary'
    }
  }
);

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = ({ className, variant, ...props }: BadgeProps) => {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
};

export { Badge, badgeVariants };
