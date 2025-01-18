import { Message } from '../../../../shared/model';
import { areMessagePropsEqual } from '../../common/utils';
import { useUser } from '../../context/UserContext';
import { memo } from 'react';
import { ChatMessageHeader } from './ChatMessageHeader';
import { ChatMessageContent } from './ChatMessageContent';
import { ChatMessageContainer } from './ChatMessageContainer';

const ChatMessageComponent = ({ message }: { message: Message }) => {
  const { user } = useUser();
  if (!user) return null;

  return (
    <ChatMessageContainer role={message.role}>
      <ChatMessageHeader role={message.role} picture={user.picture} username={user.username} />
      <ChatMessageContent message={message} />
    </ChatMessageContainer>
  );
};

export const ChatMessage = memo(ChatMessageComponent, areMessagePropsEqual);
