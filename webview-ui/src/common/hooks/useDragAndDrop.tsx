import { type DragEvent, useCallback, useMemo, useRef, useState } from 'react'
import type { UseDragAndDrop } from '../utils'

export const useDragAndDrop = <T,>({
  onDrop,
  validate,
  onInvalid,
  onError
}: UseDragAndDrop<T>) => {
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

    if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
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
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragging(false)
      dragCounterRef.current = 0

      const file = e.dataTransfer?.files?.[0]

      if (!file) {
        return
      }

      if (validate && !validate(file)) {
        onInvalid?.(file)
        return
      }

      try {
        await onDrop(file)
      } catch (error) {
        onError?.(error as Error)
      }
    },
    [onDrop, validate, onInvalid, onError]
  )

  return useMemo(
    () => ({
      isDragging,
      handlers: {
        onDragEnter: handleDragIn,
        onDragLeave: handleDragOut,
        onDragOver: handleDrag,
        onDrop: handleDrop
      }
    }),
    [isDragging, handleDragIn, handleDragOut, handleDrag, handleDrop]
  )
}
