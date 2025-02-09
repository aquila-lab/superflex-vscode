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

const isBase64Image = (src: string): boolean => {
  // Check if it's already a data URI
  if (src.startsWith('data:image/')) {
    return true
  }

  // Check if it's a raw base64 string
  try {
    // Try to decode a small sample of the string to validate it's base64
    atob(src.slice(0, 20))
    return true
  } catch {
    return false
  }
}

const isValidImageUrl = (src: string): boolean => {
  try {
    const url = new URL(src)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

const formatImageSrc = (src: string): string => {
  if (src.startsWith('data:image/')) {
    return src
  }
  // If it's a valid base64 string but doesn't have the prefix, add it
  if (isBase64Image(src)) {
    return `data:image/png;base64,${src}`
  }
  return src
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
  const isValidSrc = src && (isBase64Image(src) || isValidImageUrl(src))

  return (
    <div className={cn('relative bg-muted', imagePreviewVariants({ size }))}>
      {isLoading ? (
        <div className='flex items-center justify-center w-full h-full'>
          <Spinner size={spinnerSize} />
        </div>
      ) : isValidSrc ? (
        <img
          src={formatImageSrc(src)}
          className={cn(imagePreviewVariants({ size }), className)}
          {...props}
        />
      ) : (
        <div className={cn(imagePreviewVariants({ size }), className)}>
          Invalid image source
        </div>
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
