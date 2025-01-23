import { useMemo } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { ChatMessage } from './ChatMessage';
import { EditModeProvider } from '../../context/EditModeContext';

export const ChatMessages = () => {
  const { messages } = useMessages();

  const renderMessages = useMemo(
    () => messages.map((message) => <ChatMessage key={message.id} message={message} />),
    [messages]
  );

  return <EditModeProvider>{renderMessages}</EditModeProvider>;
};
