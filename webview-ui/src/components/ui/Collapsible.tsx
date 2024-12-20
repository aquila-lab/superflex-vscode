import React from 'react';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import clsx from 'clsx';

const Collapsible = CollapsiblePrimitive.Root;

const CollapsibleTrigger = CollapsiblePrimitive.CollapsibleTrigger;

// Same as the standard shadcn/ui CollapsibleContent, but adds the required animation classes so it animates up and down like the accordian.
const CollapsibleContent = (props: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) => (
  <CollapsiblePrimitive.CollapsibleContent
    className={clsx(
      // Radix adds data-state open/closed, and custom props for the content height. The animation is configured in tailwind.config.js
      'overflow-hidden transition data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down',
      props.className
    )}
    {...props}
  />
);

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
