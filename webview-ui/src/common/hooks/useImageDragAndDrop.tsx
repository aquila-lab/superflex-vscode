import { useCallback } from 'react'
import { type UseImageDragAndDrop, readImageFileAsBase64 } from '../utils'
import { useDragAndDrop } from './useDragAndDrop'

export const useImageDragAndDrop = ({
  onImageDrop,
  onInvalidFile,
  onError
}: UseImageDragAndDrop) => {
  const validateImage = useCallback((file: File) => {
    const validTypes = ['image/jpeg', 'image/png']
    return validTypes.includes(file.type)
  }, [])

  return useDragAndDrop({
    validate: validateImage,
    onDrop: async file => {
      const imageBase64 = await readImageFileAsBase64(file)
      onImageDrop(imageBase64)
    },
    onInvalid: file => onInvalidFile?.(file.type),
    onError
  })
}
