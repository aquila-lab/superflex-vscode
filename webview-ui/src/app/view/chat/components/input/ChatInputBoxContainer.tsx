import { type ReactNode, useEffect, useRef } from 'react'
import {
  cn,
  chatInputDisabledClasses,
  chatInputEnabledClasses
} from '../../../../../common/utils'
import { useMessages } from '../../../../layers/authenticated/providers/MessagesProvider'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { useInput } from '../../providers/InputProvider'

export const ChatInputBoxWrapperContainer = ({
  children
}: { children: ReactNode }) => {
  const { input, focusInput, messageId } = useInput()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()
  const { isEditMode, setIsEditMode, setIsDraft, isMainTextbox } = useEditMode()
  const { getMessage, updateUserMessage } = useMessages()
  const wrapperRef = useRef<HTMLDivElement>(null)
  const isDisabled =
    (isMessageProcessing || isMessageStreaming) && isMainTextbox

  useEffect(() => {
    const handlePointer = (event: PointerEvent) => {
      const isClickInside = wrapperRef.current?.contains(event.target as Node)

      if (!isClickInside) {
        setIsEditMode(false)

        if (messageId) {
          const message = getMessage(messageId)

          if (message?.content.text !== input) {
            setIsDraft(true)
            updateUserMessage(messageId, input)
          }
        }

        return
      }

      if (!isEditMode) {
        setIsEditMode(true)
        focusInput()
      }
    }

    document.addEventListener('pointerdown', handlePointer, true)
    return () =>
      document.removeEventListener('pointerdown', handlePointer, true)
  }, [
    input,
    isEditMode,
    messageId,
    setIsEditMode,
    setIsDraft,
    getMessage,
    updateUserMessage,
    focusInput
  ])

  return (
    <div
      ref={wrapperRef}
      className={cn(
        isDisabled ? chatInputDisabledClasses : chatInputEnabledClasses
      )}
    >
      <div className='relative flex flex-col bg-input rounded-md z-10'>
        {children}
      </div>
    </div>
  )
}
