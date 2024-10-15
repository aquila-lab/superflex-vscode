import React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';
import { type VariantProps, cva } from 'class-variance-authority';

import { cn } from '../../common/utils';

const imagePreviewVariants = cva('object-cover rounded-md', {
  variants: {
    size: {
      default: 'w-full h-auto',
      sm: 'size-12'
    }
  },
  defaultVariants: {
    size: 'default'
  }
});

const imagePreviewSpinnerVariants = cva('animate-spin', {
  variants: {
    spinnerSize: {
      default: 'size-16',
      sm: 'size-5'
    }
  },
  defaultVariants: {
    spinnerSize: 'default'
  }
});

interface ImagePreviewProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof imagePreviewVariants>,
    VariantProps<typeof imagePreviewSpinnerVariants> {
  isLoading: boolean;
  onRemove?: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isLoading,
  onRemove,
  size,
  spinnerSize,
  src,
  className,
  ...props
}) => {
  return (
    <div className="relative">
      {isLoading ? (
        <svg className={cn(imagePreviewSpinnerVariants({ spinnerSize }))} />
      ) : (
        <img src={src} className={cn(imagePreviewVariants({ size }), className)} {...props} />
      )}

      {onRemove && (
        <button
          aria-label="Remove image"
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center size-3.5 bg-background rounded-md border border-border hover:bg-muted"
          onClick={onRemove}>
          <Cross2Icon className="size-2.5" />
        </button>
      )}
    </div>
  );
};

export { ImagePreview };
