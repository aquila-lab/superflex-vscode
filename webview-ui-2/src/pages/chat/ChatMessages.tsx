import { useMemo } from 'react'
import { Role } from '../../../../shared/model'
import { EditModeProvider } from '../../context/EditModeContext'
import { useMessages } from '../../context/MessagesContext'
import { AssistantMessage } from './AssistantMessage'
import { ChatInputBox } from './ChatInputBox'

const MessageWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className='mb-2'>{children}</div>
)

export const ChatMessages = () => {
  const { messages } = useMessages()

  const renderedMessages = useMemo(
    () =>
      messages.map(message => {
        const { id, role, content } = message

        switch (role) {
          case Role.User:
            return (
              <MessageWrapper key={id}>
                <EditModeProvider>
                  <ChatInputBox content={content} />
                </EditModeProvider>
              </MessageWrapper>
            )

          case Role.Assistant:
            return (
              <MessageWrapper key={id}>
                <AssistantMessage text={content.text || ''} />
              </MessageWrapper>
            )

          default:
            console.warn(`Unsupported message role: ${role}`)
            return null
        }
      }),
    [messages]
  )

  return <div className='flex flex-col'>{renderedMessages}</div>
}
