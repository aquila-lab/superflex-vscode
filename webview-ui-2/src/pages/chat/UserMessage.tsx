import { Message, MessageType } from '../../../../shared/model';
import { ImagePreview } from './ImagePreview';
import { MarkdownRender } from './MarkdownRender';

export const UserMessage = ({ message }: { message: Message }) => {
  switch (message.content.type) {
    case MessageType.Text:
      return <MarkdownRender role={message.role}>{message.content.text}</MarkdownRender>;
    case MessageType.Image:
    case MessageType.Figma:
      return <ImagePreview alt="preview image" className="mt-2" src={message.content.image} />;
    default:
      return null;
  }
};
