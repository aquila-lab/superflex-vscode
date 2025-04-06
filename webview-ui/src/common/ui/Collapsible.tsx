import * as CollapsiblePrimitive from '@radix-ui/react-collapsible'
import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { forwardRef } from 'react'
import { cn } from '../utils'
import ScrollToBottom from 'react-scroll-to-bottom'

const Collapsible = CollapsiblePrimitive.Root

const CollapsibleTrigger = forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Trigger> & {
    showIcon?: boolean
    isOpen?: boolean
  }
>(({ className, children, showIcon = true, isOpen, ...props }, ref) => (
  <CollapsiblePrimitive.Trigger
    ref={ref}
    className={cn(
      'flex w-full items-center justify-between rounded-md text-sm font-medium transition-all hover:bg-muted/50 [&[data-state=open]>svg]:rotate-0',
      className
    )}
    {...props}
  >
    {children}
    {showIcon && (
      <div className='shrink-0 transition-transform ml-2'>
        {isOpen ? (
          <ChevronUpIcon className='h-4 w-4' />
        ) : (
          <ChevronDownIcon className='h-4 w-4' />
        )}
      </div>
    )}
  </CollapsiblePrimitive.Trigger>
))
CollapsibleTrigger.displayName = CollapsiblePrimitive.Trigger.displayName

const CollapsibleContent = forwardRef<
  React.ElementRef<typeof CollapsiblePrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof CollapsiblePrimitive.Content> & {
    maxHeight?: string
    open?: boolean
  }
>(({ className, children, maxHeight = '500px', open, ...props }, ref) => (
  <CollapsiblePrimitive.Content
    ref={ref}
    className={cn(
      'overflow-hidden data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
      className
    )}
    style={{
      maxHeight: open ? maxHeight : undefined,
      overflowY: open ? 'auto' : 'hidden'
    }}
    {...props}
  >
    <div className='py-2'>
      <ScrollToBottom
        className='flex flex-col gap-y-2 overflow-y-auto scroll-to-bottom'
        initialScrollBehavior='auto'
        mode='bottom'
      >
        {children}
      </ScrollToBottom>
    </div>
  </CollapsiblePrimitive.Content>
))
CollapsibleContent.displayName = CollapsiblePrimitive.Content.displayName

export { Collapsible, CollapsibleTrigger, CollapsibleContent }
