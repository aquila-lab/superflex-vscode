import React from 'react';

import { ChatMessage as ChatMessageType } from '../../core/message/ChatMessage.model';
import { Role, MessageType } from '../../../../shared/model';
import { MarkdownRender } from '../ui/MarkdownRender';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { ImagePreview } from '../ui/ImagePreview';

declare global {
  interface Window {
    superflexLogoUri: string;
  }
}

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
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

      {message.type === MessageType.Text && <MarkdownRender mdString={message.content} />}

      {message.type === MessageType.Image && (
        <ImagePreview
          alt="preview image"
          className="mt-2"
          isLoading={message.content === 'loading'}
          src={message.content}
        />
      )}
    </div>
  );
};
