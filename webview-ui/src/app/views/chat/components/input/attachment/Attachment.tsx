import { useCallback, useMemo } from 'react'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { usePostMessage } from '../../../../../layers/global/hooks/usePostMessage'
import { ImagePreview } from './ImagePreview'
import { useAttachmentPreview } from '../../../hooks/useAttachmentPreview'

export const Attachment = () => {
  const { imageAttachment, figmaAttachment, removeAttachment } = useAttachment()
  const { isEditMode, isMainTextarea } = useEditMode()
  const postMessage = usePostMessage()

  const handleRemoveAttachment = useCallback(
    () => removeAttachment(),
    [removeAttachment]
  )

  const src = useMemo(
    () => figmaAttachment?.imageUrl || imageAttachment || '',
    [figmaAttachment, imageAttachment]
  )

  const handlePreviewAttachment = useAttachmentPreview(
    imageAttachment,
    figmaAttachment,
    postMessage
  )

  if (!(imageAttachment || figmaAttachment)) {
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
          onClick={handlePreviewAttachment}
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
          onClick={handlePreviewAttachment}
        />
      </div>
    </div>
  )
}
