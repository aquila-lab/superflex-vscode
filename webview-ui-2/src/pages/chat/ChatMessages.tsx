import { useMemo } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { EditModeProvider } from '../../context/EditModeContext';
import { Role } from '../../../../shared/model';
import { ChatInputBox } from './ChatInputBox';
import { AssistantMessage } from './AssistantMessage';

export const ChatMessages = () => {
  const { messages } = useMessages();

  return useMemo(
    () =>
      messages.map((message) => {
        switch (message.role) {
          case Role.User:
            return (
              <EditModeProvider key={message.id}>
                <ChatInputBox content={message.content} />
              </EditModeProvider>
            );
          case Role.Assistant:
            return <AssistantMessage text={message.content.text ?? ''} />;
          default:
            return null;
        }
      }),
    [messages]
  );
};
