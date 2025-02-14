import { useEffect } from 'react'
import type { RefObject } from 'react'
import { useMessages } from '../../../layers/authenticated/providers/MessagesProvider'
import { useInput } from '../providers/InputProvider'
import { useEditMode } from '../providers/EditModeProvider'

export const useTextareaClickHandler = ({
  wrapperRef
}: {
  wrapperRef: RefObject<HTMLDivElement | null>
}) => {
  const { input, focusInput, messageId } = useInput()
  const { getMessage, updateUserMessage } = useMessages()
  const { isEditMode, setIsEditMode, setIsDraft } = useEditMode()

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
    focusInput,
    wrapperRef
  ])
}
