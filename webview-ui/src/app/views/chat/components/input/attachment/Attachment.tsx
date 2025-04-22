import { useCallback, useMemo } from 'react'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { usePostMessage } from '../../../../../layers/global/hooks/usePostMessage'
import { ImagePreview } from './ImagePreview'
import { useAttachmentPreview } from '../../../hooks/useAttachmentPreview'
import { ExternalLinkIcon } from '@radix-ui/react-icons'

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
    <div className='m-2 rounded-md overflow-hidden border border-border shadow-sm'>
      <div className='relative'>
        <div className='max-h-52 overflow-hidden'>
          <ImagePreview
            size='default'
            alt='preview image'
            src={src}
            onClick={handlePreviewAttachment}
            className='bg-white/95 w-full object-cover'
          />
        </div>
        <div className='absolute inset-0 bg-gradient-to-t from-background/40 via-background/30 to-background/40 pointer-events-none' />
        <div className='absolute top-2 right-2 pointer-events-none'>
          <div className='bg-muted size-8 rounded-full flex items-center justify-center opacity-80 shadow-sm'>
            <ExternalLinkIcon className='size-4' />
          </div>
        </div>
      </div>
    </div>
  )
}
