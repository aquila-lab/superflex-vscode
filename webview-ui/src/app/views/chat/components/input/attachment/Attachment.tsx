import { useCallback, useMemo } from 'react'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { ImagePreview } from './ImagePreview'

export const Attachment = () => {
  const { imageAttachment, figmaAttachment, isFigmaLoading, removeAttachment } =
    useAttachment()
  const { isEditMode, isMainTextarea } = useEditMode()

  const handleRemoveAttachment = useCallback(
    () => removeAttachment(),
    [removeAttachment]
  )

  const src = useMemo(
    () => figmaAttachment?.imageUrl || imageAttachment || '',
    [figmaAttachment, imageAttachment]
  )

  if (!(imageAttachment || figmaAttachment || isFigmaLoading)) {
    return null
  }

  if (isMainTextarea) {
    return (
      <div className='flex items-center bg-transparent p-2'>
        <ImagePreview
          size='sm'
          spinnerSize='sm'
          alt='preview image'
          src={src}
          isLoading={isFigmaLoading}
          {...(isEditMode && { onRemove: handleRemoveAttachment })}
        />
      </div>
    )
  }

  return (
    <div className='m-2 bg-background'>
      <div className='max-h-52 overflow-hidden relative'>
        <ImagePreview
          size='default'
          alt='preview image'
          src={src}
          isLoading={isFigmaLoading}
          {...(isEditMode && { onRemove: handleRemoveAttachment })}
        />
      </div>
    </div>
  )
}
