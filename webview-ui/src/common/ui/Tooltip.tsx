import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import React from 'react'

import { cn } from '../../common/utils'

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = ({
  children,
  delayDuration = 300,
  ...props
}: TooltipPrimitive.TooltipProps) => (
  <TooltipPrimitive.Root
    delayDuration={delayDuration}
    {...props}
  >
    {children}
  </TooltipPrimitive.Root>
)

const TooltipTrigger = TooltipPrimitive.Trigger

interface TooltipContentProps
  extends React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content> {
  portal?: boolean
}

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ portal, className, sideOffset = 4, ...props }, ref) => {
  const Portal = portal ? TooltipPrimitive.Portal : React.Fragment

  return (
    <Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          'z-50 overflow-hidden flex items-center rounded-md border border-border leading-tight bg-popover ml-2 px-2 py-1 text-xs text-popover-foreground text-center whitespace-pre-line shadow-lg [&_kbd]:ml-3 [&_kbd]:-mr-1 [&_kbd]:mt-[-4px] [&_kbd]:mb-[-4px]',
          className
        )}
        {...props}
      >
        {props.children}
      </TooltipPrimitive.Content>
    </Portal>
  )
})

TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
