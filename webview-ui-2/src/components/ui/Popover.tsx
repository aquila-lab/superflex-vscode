import React from 'react';
import * as PopoverPrimitive from '@radix-ui/react-popover';

import { cn } from '../../common/utils';

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = 'start', sideOffset = 5, ...props }, ref) => {
  const portalRef = React.useRef<HTMLDivElement>(null);
  return (
    <>
      {/* Use a portal that's in the same DOM tree to make focus handling easier. */}
      <div ref={portalRef} className="empty:hidden" />
      {portalRef.current && (
        <PopoverPrimitive.Portal container={portalRef.current}>
          <PopoverPrimitive.Content
            ref={ref}
            align={align}
            sideOffset={sideOffset}
            className={cn(
              'z-50 w-72 rounded-md border border-border bg-popover p-4 text-popover-foreground shadow-md outline-none',
              className
            )}
            {...props}
          />
        </PopoverPrimitive.Portal>
      )}
    </>
  );
});

PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent };
