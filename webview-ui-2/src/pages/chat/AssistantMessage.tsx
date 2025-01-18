import { Message, MessageType } from '../../../../shared/model';
import { MarkdownRender } from './MarkdownRender';

export const AssistantMessage = ({ message }: { message: Message }) => {
  switch (message.content.type) {
    case MessageType.Text:
      return <MarkdownRender role={message.role}>{message.content.text}</MarkdownRender>;
    case MessageType.TextDelta:
      return (
        <MarkdownRender role={message.role} isStreaming>
          {message.content.value}
        </MarkdownRender>
      );
    default:
      return null;
  }
};
