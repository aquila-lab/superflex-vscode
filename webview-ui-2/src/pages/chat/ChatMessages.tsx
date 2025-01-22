import { useMemo } from 'react';
import { useMessages } from '../../context/MessagesContext';
import { ChatMessage } from './ChatMessage';

export const ChatMessages = () => {
  const { messages } = useMessages();
  
  return useMemo(() => messages.map((message) => <ChatMessage key={message.id} message={message} />), [messages]);
};
