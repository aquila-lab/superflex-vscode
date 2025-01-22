import { Message, Role } from '../../../../shared/model';
import { AssistantMessage } from './AssistantMessage';
import { UserMessage } from './UserMessage';

export const ChatMessageContent = ({ message }: { message: Message }) => {
  switch (message.role) {
    case Role.User:
      return <UserMessage message={message} />;
    case Role.Assistant:
      return <AssistantMessage message={message} />;
  }
};
