import { Message } from '../../../../shared/model';
import { ChatMessage } from './ChatMessage';

export const ChatMessages = ({ messages }: { messages: Message[] }) => {
  return messages.map((message) => <ChatMessage key={message.id} message={message} />);
};
