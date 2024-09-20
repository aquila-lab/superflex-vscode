import React from 'react';
import { Command as CommandPrimitive } from 'cmdk';

import { cn } from '../../common/utils';

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  // eslint-disable-next-line react/no-unknown-property
  <div className="flex items-center border-b border-b-border" cmdk-input-wrapper="">
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        'flex w-full border-solid border border-border bg-transparent rounded-md m-1 py-1 px-1.5 text-sm leading-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none',
        className
      )}
      inputMode="search"
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn('max-h-[500px] overflow-y-auto overflow-x-hidden', className)}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className={cn('py-1 px-1.5 text-muted-foreground font-medium text-xs', className)}
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandLoading = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Loading>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Loading>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Loading
    ref={ref}
    className={cn('py-1 px-1.5 text-muted-foreground font-medium text-xs', className)}
    {...props}
  />
));

CommandLoading.displayName = CommandPrimitive.Loading.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      'overflow-hidden text-foreground [&:not(:last-child)]:border-border [&:not(:last-child)]:border-b [&_[cmdk-group-heading]]:px-1.5 [&_[cmdk-group-heading]]:py-1 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator ref={ref} className={cn('-mx-2 my-2 h-px bg-border', className)} {...props} />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item> & { tooltip?: string }
>(({ className, tooltip, ...props }, ref) => {
  const item = (
    <CommandPrimitive.Item
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-md py-1 px-1.5 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground hover:bg-accent hover:text-accent-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50',
        className
      )}
      title={tooltip}
      {...props}
    />
  );

  return item;
});

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandRow: React.FunctionComponent<
  React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
> = ({ className, ...props }) => (
  <div
    className={cn(
      'flex flex-wrap select-none items-center gap-x-3 gap-y-1 text-sm outline-none [&:not(:last-child)]:border-border [&:not(:last-child)]:border-b [&_[cmdk-item]]:whitespace-nowrap',
      className
    )}
    {...props}
  />
);

const CommandShortcut = ({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) => {
  return <span className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)} {...props} />;
};
CommandShortcut.displayName = 'CommandShortcut';

export const CommandLink: React.FunctionComponent<
  React.AnchorHTMLAttributes<HTMLAnchorElement> & { onSelect?: () => void }
> = ({ href, className, children, onSelect, ...props }) => {
  const linkRef = React.useRef<HTMLAnchorElement>(null);

  // We use a workaround to make links work in VS Code via keyboard and click (see the
  // `dispatchEvent` call and related comment below). However, to avoid a click opening the link
  // twice, we need to check if we're already opening a link due to a click and prevent the
  // `dispatchEvent` code path from being called. When cmdk supports links
  // (https://github.com/pacocoursey/cmdk/issues/258), this workaround will no longer be needed.
  const isHandlingClick = React.useRef(false);

  return (
    <CommandItem
      onSelect={() => {
        onSelect?.();

        if (isHandlingClick.current) {
          linkRef.current?.blur(); // close after click
          return;
        }

        // TODO: When cmdk supports links, use that instead. This workaround is only needed
        // because the link's native onClick is not being fired because cmdk traps it. See
        // https://github.com/pacocoursey/cmdk/issues/258.
        //
        // This workaround successfully opens an external link in VS Code webviews (which
        // block `window.open` and plain click MouseEvents) and in browsers.
        try {
          linkRef.current?.focus();
          linkRef.current?.dispatchEvent(
            new MouseEvent('click', {
              button: 0,
              ctrlKey: true,
              metaKey: true
            })
          );
          linkRef.current?.blur();
        } catch (error) {
          console.error(error);
        } finally {
          isHandlingClick.current = false;
        }
      }}
      asChild>
      <a
        {...props}
        href={href}
        className={cn(
          '!text-foreground aria-selected:!text-accent-foreground hover:!text-accent-foreground',
          className
        )}
        onClick={(e) => {
          isHandlingClick.current = true;
          setTimeout(() => {
            isHandlingClick.current = false;
          });
        }}
        ref={linkRef}>
        {children}
      </a>
    </CommandItem>
  );
};

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandLoading,
  CommandGroup,
  CommandItem,
  CommandRow,
  CommandShortcut,
  CommandSeparator
};
