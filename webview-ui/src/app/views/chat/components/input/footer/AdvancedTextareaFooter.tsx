import { TrashIcon } from '@radix-ui/react-icons'
import { useCallback, useMemo } from 'react'
import { Button } from '../../../../../../common/ui/Button'
import { useNewMessage } from '../../../../../layers/authenticated/providers/NewMessageProvider'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { useInput } from '../../../providers/InputProvider'
import { useSendMessage } from '../../../providers/SendMessageProvider'
import { AddAttachmentButtons } from './AddAttachmentButtons'
import { SendButton } from './SendButton'
import { ResendButton } from './ResendButton'

export const AdvancedTextareaFooter = () => {
  const { input } = useInput()
  const { isEditMode, isMainTextarea } = useEditMode()
  const { isMessageProcessing, isMessageStreaming, stopStreaming } =
    useNewMessage()
  const { figmaAttachment, imageAttachment, isFigmaLoading } = useAttachment()
  const { sendMessage } = useSendMessage()

  const isDisabled = useMemo(
    () => Boolean(isMessageProcessing || isMessageStreaming || isFigmaLoading),
    [isMessageProcessing, isMessageStreaming, isFigmaLoading]
  )
  const hasContent = useMemo(
    () => Boolean(input.length > 0 || figmaAttachment || imageAttachment),
    [input.length, figmaAttachment, imageAttachment]
  )

  const handleStop = useCallback(() => {
    stopStreaming()
  }, [stopStreaming])

  const handleSend = useCallback(() => {
    sendMessage()
  }, [sendMessage])

  if (!isEditMode) {
    return null
  }

  if (!isMainTextarea) {
    return (
      <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2'>
        <AddAttachmentButtons />

        <div className='flex flex-row items-center gap-1'>
          <ResendButton
            hasContent={hasContent}
            isFigmaLoading={isFigmaLoading}
            onResend={handleSend}
          />
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2'>
      <AddAttachmentButtons />

      <div className='flex flex-row items-center gap-1'>
        {!isDisabled && (
          <SendButton
            hasContent={hasContent}
            isDisabled={isDisabled}
            onSend={handleSend}
          />
        )}
        {isDisabled && (
          <Button
            size='xs'
            variant='text'
            className='text-[11px] px-1 py-0 hover:bg-muted'
            onClick={handleStop}
          >
            <TrashIcon className='size-3.5' />
            stop
          </Button>
        )}
      </div>
    </div>
  )
}
