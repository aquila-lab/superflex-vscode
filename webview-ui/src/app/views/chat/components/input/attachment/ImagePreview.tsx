import { Cross2Icon } from '@radix-ui/react-icons'
import { type VariantProps, cva } from 'class-variance-authority'
import { Spinner } from '../../../../../../common/ui/Spinner'
import { cn } from '../../../../../../common/utils'
import { useEditMode } from '../../../providers/EditModeProvider'

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
  if (src.startsWith('data:image/')) {
    return true
  }

  try {
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
  const { isMainTextarea } = useEditMode()
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
          className={cn(
            'absolute flex items-center justify-center size-3.5 bg-background rounded-md border border-border hover:bg-muted',
            isMainTextarea ? '-top-1.5 -right-1.5' : 'top-1.5 right-1.5'
          )}
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
