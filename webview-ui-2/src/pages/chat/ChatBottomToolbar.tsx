import { TrashIcon } from '@radix-ui/react-icons'
import { useCallback } from 'react'
import { IoIosReturnLeft } from 'react-icons/io'
import { Button } from '../../components/ui/Button'
import { useAttachment } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { useFiles } from '../../context/FilesProvider'
import { useInput } from '../../context/InputContext'
import { useNewMessage } from '../../context/NewMessageContext'
import { FigmaButton } from './FigmaButton'
import { FilePicker } from './FilePicker'

export const ChatBottomToolbar = () => {
  const { input, setInput, messageId } = useInput()
  const { selectedFiles, clearManuallySelectedFiles } = useFiles()
  const { isEditMode } = useEditMode()
  const { sendMessageContent, isMessageProcessing, isMessageStreaming } =
    useNewMessage()
  const { figmaAttachment, removeAttachment, imageAttachment, isFigmaLoading } =
    useAttachment()
  const isDisabled = isMessageProcessing || isMessageStreaming || isFigmaLoading

  const handleMessageStopped = useCallback(() => {
    // stopMessage();
  }, [])

  const handleButtonClicked = useCallback(() => {
    sendMessageContent({
      text: input,
      attachment:
        figmaAttachment || imageAttachment
          ? {
              figma: figmaAttachment ?? undefined,
              image: imageAttachment ?? undefined
            }
          : undefined,
      fromMessageID: messageId ?? undefined,
      files: selectedFiles
    })
    setInput('')
    removeAttachment()
    clearManuallySelectedFiles()
  }, [
    messageId,
    figmaAttachment,
    imageAttachment,
    input,
    sendMessageContent,
    setInput,
    removeAttachment,
    selectedFiles,
    clearManuallySelectedFiles
  ])

  if (!isEditMode) {
    return null
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
              !isDisabled && (input.length > 0 || figmaAttachment)
                ? 'active'
                : 'none'
            }
            disabled={isDisabled || !(input.length || figmaAttachment)}
            className={isDisabled ? 'opacity-60' : ''}
            onClick={handleButtonClicked}
          >
            <span className='sr-only'>Enter</span>
            <IoIosReturnLeft className='size-4' aria-hidden='true' />
            <span>send</span>
          </Button>
        )}
        {isDisabled && (
          <Button
            size='xs'
            variant='text'
            className='text-[11px] px-1 py-0 hover:bg-muted'
            onClick={handleMessageStopped}
          >
            <TrashIcon className='size-3.5' />
            Stop
          </Button>
        )}
      </div>
    </div>
  )
}
