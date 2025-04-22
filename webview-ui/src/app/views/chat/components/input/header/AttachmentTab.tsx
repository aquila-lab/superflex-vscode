import { Cross2Icon } from '@radix-ui/react-icons'
import { type MouseEvent, useCallback, useMemo } from 'react'
import { EventRequestType } from '../../../../../../../../shared/protocol'
import type {
  AttachmentPreviewData,
  OpenFilePayload
} from '../../../../../../../../shared/protocol/types'
import { Button } from '../../../../../../common/ui/Button'
import { cn } from '../../../../../../common/utils'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { usePostMessage } from '../../../../../layers/global/hooks/usePostMessage'
import { FileIcon } from '../../../../../../common/ui/FileIcon'

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

  const handlePreviewAttachment = useCallback(() => {
    const hasFigmaWithImage =
      figmaAttachment &&
      typeof figmaAttachment === 'object' &&
      'imageUrl' in figmaAttachment &&
      figmaAttachment.imageUrl

    if (hasFigmaWithImage) {
      const figmaPreviewData: AttachmentPreviewData = {
        type: 'figma',
        imageUrl: figmaAttachment.imageUrl,
        fileID: figmaAttachment.fileID,
        nodeID: figmaAttachment.nodeID
      }

      const payload: OpenFilePayload = {
        filePath: `attachment://figma/${Date.now()}`,
        attachmentData: figmaPreviewData
      }

      postMessage(EventRequestType.OPEN_FILE, payload)
    } else if (imageAttachment) {
      const imagePreviewData: AttachmentPreviewData = {
        type: 'image',
        base64Data: imageAttachment
      }

      const payload: OpenFilePayload = {
        filePath: `attachment://image/${Date.now()}`,
        attachmentData: imagePreviewData
      }

      postMessage(EventRequestType.OPEN_FILE, payload)
    }
  }, [figmaAttachment, imageAttachment, postMessage])

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
