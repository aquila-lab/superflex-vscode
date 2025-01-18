import { useMessages } from '../../context/MessagesContext';
import { StreamingMessage } from './StreamingMessage';
import { ChatMessages } from './ChatMessages';
import { ChatMessageListContainer } from './ChatMessageListContainer';

export const ChatMessageList = () => {
  const { messages } = useMessages();

  return (
    <ChatMessageListContainer>
      <ChatMessages messages={messages} />
      <StreamingMessage />
    </ChatMessageListContainer>
  );
};
