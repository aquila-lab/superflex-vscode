import { useNewMessage } from '../../context/NewMessageContext';
import { ChatMessage } from './ChatMessage';

export const StreamingMessage = () => {
  const { message } = useNewMessage();

  if (!message) return null;

  return <ChatMessage message={message} />;
};
