import { useMemo } from 'react'
import { Role } from '../../../../../../../shared/model'
import { cn } from '../../../../../common/utils'
import { useMessages } from '../../../../layers/authenticated/providers/MessagesProvider'
import { useOverlay } from '../../../../layers/authenticated/providers/OverlayProvider'
import { EditModeProvider } from '../../providers/EditModeProvider'
import { AssistantMessage } from './assistant/AssistantMessage'
import { MessageBox } from './shared/MessageBox'
import { AdvancedTextarea } from '../input/AdvancedTextarea'

export const Messages = () => {
  const { messages } = useMessages()
  const { activeMessageId } = useOverlay()

  const renderedMessages = useMemo(
    () =>
      messages.map(message => {
        const { id, role, content } = message
        const isActive = id === activeMessageId

        const messageClasses = cn(
          'relative',
          isActive && 'z-50'
        )

        switch (role) {
          case Role.User:
            return (
              <MessageBox
                key={id}
                className={messageClasses}
              >
                <EditModeProvider>
                  <AdvancedTextarea
                    content={content}
                    messageId={id}
                  />
                </EditModeProvider>
              </MessageBox>
            )

          case Role.Assistant:
            return (
              <MessageBox key={id}>
                <AssistantMessage
                  message={message}
                  hasFeedback
                />
              </MessageBox>
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
