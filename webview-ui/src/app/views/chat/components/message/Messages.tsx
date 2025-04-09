import { useMemo } from 'react'
import { type Message, Role } from '../../../../../../../shared/model'
import { cn } from '../../../../../common/utils'
import { useMessages } from '../../../../layers/authenticated/providers/MessagesProvider'
import { useOverlay } from '../../../../layers/authenticated/providers/OverlayProvider'
import { EditModeProvider } from '../../providers/EditModeProvider'
import { AdvancedTextarea } from '../input/AdvancedTextarea'
import { AssistantMessage } from './assistant/AssistantMessage'
import { MessageBox } from './shared/MessageBox'
import { ThinkingMessage } from './thinking/ThinkingMessage'

const extractThinkingContent = (text: string): string | null => {
  const thinkingMatch = text.match(/<Thinking>([\s\S]*?)<\/Thinking>/)
  return thinkingMatch ? thinkingMatch[1].trim() : null
}

export const Messages = ({
  messages: propMessages
}: { messages?: Message[] }) => {
  const { messages: contextMessages } = useMessages()
  const { activeMessageId } = useOverlay()

  // Use provided messages or fall back to context
  const messagesToRender = useMemo(
    () => propMessages ?? contextMessages,
    [propMessages, contextMessages]
  )

  const renderedMessages = useMemo(
    () =>
      messagesToRender.map(message => {
        const { id, role, content } = message
        const isActive = id === activeMessageId

        const messageClasses = cn('relative', isActive && 'z-50')

        switch (role) {
          case Role.User:
            return (
              <div key={id}>
                <MessageBox className={messageClasses}>
                  <EditModeProvider>
                    <AdvancedTextarea
                      content={content}
                      messageId={id}
                    />
                  </EditModeProvider>
                </MessageBox>
                {content.enhancedText && (
                  <ThinkingMessage
                    content={content.enhancedText}
                    type='enhance'
                  />
                )}
              </div>
            )

          case Role.Assistant: {
            const thinkingContent = content.text
              ? extractThinkingContent(content.text)
              : null

            const messageContent = { ...content }

            if (thinkingContent && messageContent.text) {
              messageContent.text = messageContent.text
                .replace(/<Thinking>[\s\S]*?<\/Thinking>/, '')
                .trim()
            }

            return (
              <div key={id}>
                {thinkingContent && (
                  <ThinkingMessage
                    content={thinkingContent}
                    type='thinking'
                  />
                )}
                <MessageBox>
                  <AssistantMessage
                    message={{ ...message, content: messageContent }}
                    hasFeedback
                  />
                </MessageBox>
              </div>
            )
          }

          default:
            console.warn(`Unsupported message role: ${role}`)
            return null
        }
      }),
    [messagesToRender, activeMessageId]
  )

  return <div className='flex flex-col relative'>{renderedMessages}</div>
}
