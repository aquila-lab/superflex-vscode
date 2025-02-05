import { useMemo } from 'react'
import { Role } from '../../../../shared/model'
import { EditModeProvider } from '../../context/EditModeContext'
import { useMessages } from '../../context/MessagesContext'
import { AssistantMessage } from './AssistantMessage'
import { ChatInputBox } from './ChatInputBox'

export const ChatMessages = () => {
  const { messages } = useMessages()

  return useMemo(
    () =>
      messages.map(message => {
        switch (message.role) {
          case Role.User:
            return (
              <EditModeProvider key={message.id}>
                <ChatInputBox content={message.content} />
              </EditModeProvider>
            )
          case Role.Assistant:
            return <AssistantMessage text={message.content.text ?? ''} />
          default:
            return null
        }
      }),
    [messages]
  )
}
