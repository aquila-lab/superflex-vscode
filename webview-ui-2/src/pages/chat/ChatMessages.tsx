import { useMemo } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { ChatMessage } from './ChatMessage';
import { EditModeProvider } from '../../context/EditModeContext';

export const ChatMessages = () => {
  const { messages } = useMessages();

  return useMemo(
    () =>
      messages.map((message) => (
        <EditModeProvider key={message.id}>
          <ChatMessage message={message} />
        </EditModeProvider>
      )),
    [messages]
  )
};
