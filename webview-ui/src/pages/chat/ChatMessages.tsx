import { useMemo } from 'react'
import { Role } from '../../../../shared/model'
import { EditModeProvider } from '../../context/EditModeContext'
import { useMessages } from '../../context/MessagesContext'
import { AssistantMessage } from './AssistantMessage'
import { ChatInputBoxWrapper } from './ChatInputBoxWrapper'
import { useOverlay } from '../../context/OverlayContext'
import { MessageWrapper } from './ChatMessageWrapper'
import { cn } from '../../common/utils'

export const ChatMessages = () => {
  const { messages } = useMessages()
  const { activeMessageId } = useOverlay()

  const renderedMessages = useMemo(
    () =>
      messages.map(message => {
        const { id, role, content } = message
        const isActive = id === activeMessageId

        const messageClasses = cn(
          'relative transition-all duration-200',
          isActive && 'z-50'
        )

        switch (role) {
          case Role.User:
            return (
              <MessageWrapper key={id} className={messageClasses}>
                <EditModeProvider>
                  <ChatInputBoxWrapper content={content} messageId={id} />
                </EditModeProvider>
              </MessageWrapper>
            )

          case Role.Assistant:
            return (
              <MessageWrapper key={id}>
                <AssistantMessage message={message} hasFeedback />
              </MessageWrapper>
            )

          default:
            console.warn(`Unsupported message role: ${role}`)
            return null
        }
      }),
    [messages, activeMessageId]
  )

  return <div className='flex flex-col relative'>{renderedMessages}</div>
}
