import React from 'react';

import { ChatMessage as ChatMessageType } from '../../core/message/ChatMessage.model';
import { Role, MessageType } from '../../../../shared/model';
import { MarkdownRender } from '../ui/MarkdownRender';

interface ChatMessageProps {
  message: ChatMessageType;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  return (
    <div
      className={`py-4 px-2 border-b border-border text-left ${message.role === Role.User ? 'bg-muted' : undefined}`}>
      <p className="text-sm font-medium text-primary mb-2">{message.role === Role.User ? 'You' : 'Superflex'}</p>

      {message.type === MessageType.Text && <MarkdownRender mdString={message.content} />}

      {message.type === MessageType.Image && <img alt="preview image" className="mt-2" src={message.content} />}
    </div>
  );
};
