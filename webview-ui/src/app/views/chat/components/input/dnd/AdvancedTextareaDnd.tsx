import { type ReactNode, useCallback } from 'react'
import { useImageDragAndDrop } from '../../../../../../common/hooks/useImageDragAndDrop'
import { cn } from '../../../../../../common/utils'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { DropOverlay } from './DropOverlay'

export const AdvancedTextareaDnd = ({ children }: { children: ReactNode }) => {
  const { setImageAttachment, removeAttachment } = useAttachment()

  const handleImageDrop = useCallback(
    (imageBase64: string) => {
      removeAttachment()
      setImageAttachment(imageBase64)
    },
    [removeAttachment, setImageAttachment]
  )

  const { isDragging, handlers } = useImageDragAndDrop({
    onImageDrop: handleImageDrop,
    onInvalidFile: fileType => console.error(`Invalid file type: ${fileType}`),
    onError: error => console.error(`Error processing dropped image: ${error}`)
  })

  return (
    <div
      {...handlers}
      className={cn(
        'relative',
        isDragging &&
          'after:absolute after:inset-0 after:border-2 after:border-dashed after:border-primary after:bg-primary/5 after:rounded-md'
      )}
    >
      {children}
      <DropOverlay isDragging={isDragging} />
    </div>
  )
}
