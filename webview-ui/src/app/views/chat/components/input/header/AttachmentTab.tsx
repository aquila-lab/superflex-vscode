import { Cross2Icon } from '@radix-ui/react-icons'
import { type MouseEvent, useCallback, useMemo } from 'react'
import { Button } from '../../../../../../common/ui/Button'
import { cn } from '../../../../../../common/utils'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { usePostMessage } from '../../../../../layers/global/hooks/usePostMessage'
import { FileIcon } from '../../../../../../common/ui/FileIcon'
import { useAttachmentPreview } from '../../../hooks/useAttachmentPreview'

export const AttachmentTab = () => {
  const { imageAttachment, figmaAttachment, removeAttachment } = useAttachment()
  const { isEditMode } = useEditMode()
  const postMessage = usePostMessage()

  const isAttachmentActive = useMemo(
    () => Boolean(imageAttachment || figmaAttachment),
    [imageAttachment, figmaAttachment]
  )

  const handleDeselectAttachment = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      removeAttachment()
    },
    [removeAttachment]
  )

  const handlePreviewAttachment = useAttachmentPreview(
    imageAttachment,
    figmaAttachment,
    postMessage
  )

  if (!isAttachmentActive) {
    return null
  }

  const attachmentName = figmaAttachment ? 'figma.preview' : 'image.preview'

  return (
    <div className='flex flex-col'>
      <div
        className={cn(
          'flex items-center gap-0.5 bg-background rounded-md pl-0.5 pr-1.5 cursor-pointer',
          'border border-border'
        )}
        onClick={handlePreviewAttachment}
      >
        <div className='flex flex-row items-center gap-0.5'>
          <FileIcon
            filePath={attachmentName}
            className='size-5'
          />
          <p className='text-xxs text-foreground truncate max-w-24'>
            {attachmentName}
          </p>
        </div>
        {isEditMode && (
          <div className='ml-auto flex gap-2 mt-0.5'>
            <Button
              size='xs'
              variant='text'
              className='p-0'
              onClick={handleDeselectAttachment}
              aria-label='remove-attachment'
            >
              <Cross2Icon className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
