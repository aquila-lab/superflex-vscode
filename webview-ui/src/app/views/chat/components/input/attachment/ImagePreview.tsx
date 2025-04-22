import { Cross2Icon } from '@radix-ui/react-icons'
import type { VariantProps } from 'class-variance-authority'
import { Spinner } from '../../../../../../common/ui/Spinner'
import {
  cn,
  formatImageSrc,
  imagePreviewVariants,
  isBase64Image,
  isValidImageUrl
} from '../../../../../../common/utils'
import { useEditMode } from '../../../providers/EditModeProvider'
import type { ImgHTMLAttributes, MouseEvent } from 'react'

export const ImagePreview = ({
  isLoading = false,
  onRemove,
  onClick,
  size,
  spinnerSize = 'default',
  src,
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement> &
  VariantProps<typeof imagePreviewVariants> & {
    isLoading?: boolean
    onRemove?: () => void
    onClick?: (e: MouseEvent<HTMLImageElement>) => void
    spinnerSize?: 'sm' | 'default'
  }) => {
  const { isMainTextarea } = useEditMode()
  const isValidSrc = src && (isBase64Image(src) || isValidImageUrl(src))
  const isClickable = !!onClick && !isLoading && isValidSrc

  return (
    <div className={cn('relative bg-muted', imagePreviewVariants({ size }))}>
      {isLoading ? (
        <div className='flex items-center justify-center w-full h-full'>
          <Spinner size={spinnerSize} />
        </div>
      ) : isValidSrc ? (
        <img
          src={formatImageSrc(src)}
          className={cn(
            imagePreviewVariants({ size }),
            isClickable && 'cursor-pointer hover:opacity-90 transition-opacity',
            className
          )}
          onClick={onClick}
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
