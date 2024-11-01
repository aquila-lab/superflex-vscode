import React from 'react';

import { Role, MessageType, Message } from '../../../../shared/model';
import { ImagePreview } from '../ui/ImagePreview';
import { MarkdownRender } from '../ui/MarkdownRender';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import FeedbackDialog from './FeedbackDialog';

declare global {
  interface Window {
    superflexLogoUri: string;
  }
}

interface ChatMessageProps {
  message: Message;
  handleFeedback: (message: Message, feedback: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, handleFeedback }) => {
  const showFeedback = message.role === Role.Assistant && !message.feedback;

  return (
    <div
      className={`py-4 px-2 border-b border-border text-left rounded-lg ${message.role === Role.User ? 'bg-muted' : undefined}`}>
      <div className="flex items-center mb-2">
        {message.role !== Role.User && (
          <Avatar className="mr-2 size-5">
            <AvatarImage src={window.superflexLogoUri} alt="Superflex Logo" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
        )}
        <p className="text-sm font-medium text-primary">{message.role === Role.User ? 'You' : 'Superflex'}</p>
      </div>

      {message.content.type === MessageType.Text && <MarkdownRender mdString={message.content.text} />}

      {(message.content.type === MessageType.Image || message.content.type === MessageType.Figma) && (
        <ImagePreview alt="preview image" className="mt-2" src={message.content.image as string} />
      )}

      {showFeedback && (
        <div className="mt-4">
          <FeedbackDialog
            onFeedback={(feedback) => {
              handleFeedback(message, feedback);
            }}
          />
        </div>
      )}
    </div>
  );
};
