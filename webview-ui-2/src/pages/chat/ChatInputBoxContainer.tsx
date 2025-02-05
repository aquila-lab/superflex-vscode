import { type ReactNode, useEffect, useRef } from 'react'
import {
  chatInputDisabledClasses,
  chatInputEnabledClasses,
  cn
} from '../../common/utils'
import { useEditMode } from '../../context/EditModeContext'
import { useInput } from '../../context/InputContext'
import { useMessages } from '../../context/MessagesContext'

export const ChatInputBoxContainer = ({
  children
}: { children: ReactNode }) => {
  const { input } = useInput()
  const isDisabled = false
  const messageId = ''
  const { setIsEditMode, setIsDraft } = useEditMode()

  const { getMessage, updateUserMessage } = useMessages()
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsEditMode(false)

        if (messageId) {
          const message = getMessage(messageId)
          if (message?.content.text !== input) {
            setIsDraft(true)
            updateUserMessage(messageId, input)
          }
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [input, setIsEditMode, setIsDraft, getMessage, updateUserMessage])

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
