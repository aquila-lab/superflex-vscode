import React from 'react';
import * as FormUI from '@radix-ui/react-form';

import { cn } from '../../common/utils';

const FormRoot = FormUI.Root;

const FormField = FormUI.Field;
const FormControl = FormUI.Control;
const FormMessage = FormUI.Message;
const FormSubmit = FormUI.Submit;

const Form = React.forwardRef<React.ElementRef<typeof FormUI.Root>, React.ComponentPropsWithoutRef<typeof FormUI.Root>>(
  ({ className, title, ...props }, ref) => (
    <FormRoot name={title} className={className} {...props}>
      {props.children}
    </FormRoot>
  )
);

Form.displayName = 'Form';

const FormLabel = React.forwardRef<
  React.ElementRef<typeof FormUI.Label>,
  React.ComponentPropsWithoutRef<typeof FormUI.Label>
>(({ className, title, ...props }, ref) => (
  <FormUI.Label className={cn('tw-text-muted-foreground', className)} {...props}>
    {title ?? props.children}
  </FormUI.Label>
));

FormLabel.displayName = 'FormLabel';

export { Form, FormField, FormLabel, FormSubmit, FormControl, FormMessage };
