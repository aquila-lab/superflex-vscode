import React from 'react';
import TextareaAutosizeBase from 'react-textarea-autosize';
import { cn } from '../../common/utils';

export interface TextareaAutosizeProps extends React.ComponentPropsWithoutRef<typeof TextareaAutosizeBase> {}

const TextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextareaAutosizeBase
        className={cn(
          'flex w-full max-h-[15rem] rounded-md resize-none border border-border bg-input px-3 py-2 text-sm',
          'shadow-sm transition-colors',
          'placeholder:text-muted-foreground',
          'focus:outline-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

TextareaAutosize.displayName = 'TextareaAutosize';

export { TextareaAutosize };
