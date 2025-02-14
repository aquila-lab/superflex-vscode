import { TrashIcon } from '@radix-ui/react-icons'
import { useCallback } from 'react'
import { IoIosReturnLeft } from 'react-icons/io'
import { Button } from '../../../../../common/ui/Button'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { useAttachment } from '../../providers/AttachmentProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { useInput } from '../../providers/InputProvider'
import { useSendMessage } from '../../providers/SendMessageProvider'
import { FigmaButton } from './attachment/FigmaButton'
import { FilePicker } from './file/FilePicker'

export const AdvancedTextareaFooter = () => {
  const { input } = useInput()
  const { isEditMode, isMainTextarea } = useEditMode()
  const { isMessageProcessing, isMessageStreaming, stopStreaming } =
    useNewMessage()
  const { figmaAttachment, imageAttachment, isFigmaLoading } = useAttachment()
  const { sendMessage } = useSendMessage()
  const isDisabled = isMessageProcessing || isMessageStreaming || isFigmaLoading

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
        <div className='flex flex-row items-center gap-1'>
          <FigmaButton />
          <FilePicker />
        </div>

        <div className='flex flex-row items-center gap-1'>
          <Button
            size='xs'
            variant='text'
            active={
              !isFigmaLoading &&
              (input.length > 0 || figmaAttachment || imageAttachment)
                ? 'active'
                : 'none'
            }
            disabled={
              isFigmaLoading ||
              !(input.length || figmaAttachment || imageAttachment)
            }
            className={isFigmaLoading ? 'opacity-60' : ''}
            onClick={handleSend}
          >
            <span className='sr-only'>Enter</span>
            <IoIosReturnLeft
              className='size-4'
              aria-hidden='true'
            />
            <span>resend</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2'>
      <div className='flex flex-row items-center gap-1'>
        <FigmaButton />
        <FilePicker />
      </div>

      <div className='flex flex-row items-center gap-1'>
        {!isDisabled && (
          <Button
            size='xs'
            variant='text'
            active={
              !isDisabled &&
              (input.length > 0 || figmaAttachment || imageAttachment)
                ? 'active'
                : 'none'
            }
            disabled={
              isDisabled ||
              !(input.length || figmaAttachment || imageAttachment)
            }
            className={isDisabled ? 'opacity-60' : ''}
            onClick={handleSend}
          >
            <span className='sr-only'>Enter</span>
            <IoIosReturnLeft
              className='size-4'
              aria-hidden='true'
            />
            <span>send</span>
          </Button>
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
