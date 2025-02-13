import {
  type ReactNode,
  useCallback,
  useState,
  useRef,
  useEffect,
  type DragEvent
} from 'react'
import { useAttachment } from '../../context/AttachmentContext'
import { readImageFileAsBase64 } from '../../common/utils'
import { cn } from '../../common/utils'

export const ChatInputBoxDnd = ({
  children
}: {
  children: ReactNode
}) => {
  const { setImageAttachment, removeAttachment } = useAttachment()
  const [isDragging, setIsDragging] = useState(false)
  const dragCounterRef = useRef(0)

  const handleDrag = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current += 1
    const dragEvent = e as DragEvent

    if (
      dragEvent.dataTransfer?.items &&
      dragEvent.dataTransfer.items.length > 0
    ) {
      setIsDragging(true)
    }
  }, [])

  const handleDragOut = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounterRef.current -= 1

    if (dragCounterRef.current === 0) {
      setIsDragging(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounterRef.current = 0

      const dragEvent = e as DragEvent
      if (
        dragEvent.dataTransfer?.files &&
        dragEvent.dataTransfer.files.length > 0
      ) {
        const file = dragEvent.dataTransfer.files[0]

        const validTypes = ['image/jpeg', 'image/png']
        if (!validTypes.includes(file.type)) {
          console.error('Invalid file type. Please use PNG or JPEG images.')
          return
        }

        const maxSize = 5 * 1024 * 1024
        if (file.size > maxSize) {
          console.error('File size exceeds 5MB limit.')
          return
        }

        removeAttachment()
        readImageFileAsBase64(file)
          .then(imageBase64 => {
            setImageAttachment(imageBase64)
          })
          .catch(error => {
            console.error('Error processing dropped image:', error)
          })
      }
    },
    [removeAttachment, setImageAttachment]
  )

  return (
    <>
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={cn(
          'relative',
          isDragging &&
            'after:absolute after:inset-0 after:border-2 after:border-dashed after:border-primary after:bg-primary/5 after:rounded-md'
        )}
      >
        {children}
        {isDragging && (
          <div className='absolute inset-0 pointer-events-none z-30 bg-black/20'>
            <div className='h-full w-full flex items-center justify-center'>
              <span className='text-xs text-primary bg-sidebar px-4 py-2 rounded-md shadow-sm'>
                Drop image here
              </span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
