import { StreamingMessage } from './StreamingMessage';
import { ChatMessages } from './ChatMessages';
import { ChatMessageListContainer } from './ChatMessageListContainer';

export const ChatMessageList = () => {
  return (
    <ChatMessageListContainer>
      <ChatMessages />
      <StreamingMessage />
    </ChatMessageListContainer>
  );
};
