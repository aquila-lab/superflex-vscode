import { Cross2Icon } from '@radix-ui/react-icons'
import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '../../common/utils'
import { Spinner } from '../../components/ui/Spinner'

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
})

interface ImagePreviewProps
  extends React.ImgHTMLAttributes<HTMLImageElement>,
    VariantProps<typeof imagePreviewVariants> {
  isLoading?: boolean
  onRemove?: () => void
  spinnerSize?: 'sm' | 'default'
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  isLoading = false,
  onRemove,
  size,
  spinnerSize = 'default',
  src,
  className,
  ...props
}) => {
  return (
    <div className={cn('relative bg-muted', imagePreviewVariants({ size }))}>
      {isLoading ? (
        <div className='flex items-center justify-center w-full h-full'>
          <Spinner size={spinnerSize} />
        </div>
      ) : (
        <img
          src={src}
          className={cn(imagePreviewVariants({ size }), className)}
          {...props}
        />
      )}

      {onRemove && (
        <button
          aria-label='Remove image'
          className='absolute -top-1.5 -right-1.5 flex items-center justify-center size-3.5 bg-background rounded-md border border-border hover:bg-muted'
          onClick={onRemove}
          type='button'
        >
          <Cross2Icon className='size-2.5' />
        </button>
      )}
    </div>
  )
}

export { ImagePreview }
