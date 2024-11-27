import React, { useEffect, useState } from 'react';

import { Role, MessageType, Message } from '../../../../shared/model';
import { cn } from '../../common/utils';
import { useAppSelector } from '../../core/store';
import { ImagePreview } from '../ui/ImagePreview';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/Avatar';
import { MarkdownRender, StreamingMarkdownRender } from '../ui/MarkdownRender';
import FeedbackDialog from './FeedbackDialog';

declare global {
  interface Window {
    superflexLogoUri: string;
  }
}

interface ChatMessageProps {
  message?: Message;
  isStreaming?: boolean;
  handleFeedback: (message: Message, feedback: string) => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message, isStreaming = false, handleFeedback }) => {
  const user = useAppSelector((state) => state.user);

  const [userInfo, setUserInfo] = useState({ picture: user.picture });

  useEffect(() => {
    setUserInfo({ picture: user.picture });
  }, [user.picture]);

  const renderContent = () => {
    if (isStreaming) {
      return <StreamingMarkdownRender />;
    }

    if (message?.content.type === MessageType.Text) {
      return <MarkdownRender role={message.role} mdString={message.content.text} />;
    }

    if (message?.content.type === MessageType.Image || message?.content.type === MessageType.Figma) {
      return <ImagePreview alt="preview image" className="mt-2" src={message.content.image as string} />;
    }

    return null;
  };

  const showFeedback = message?.role === Role.Assistant && !message?.feedback;

  return (
    <div
      className={cn(
        'py-4 px-2 border-b border-border text-left rounded-lg',
        message?.role === Role.User ? 'bg-muted' : undefined
      )}>
      <div className="flex items-center mb-2">
        {message?.role !== Role.User && (
          <Avatar className="mr-2 size-5">
            <AvatarImage src={window.superflexLogoUri} alt="Superflex Logo" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
        )}
        {message?.role === Role.User && userInfo.picture && (
          <Avatar className="mr-2 size-5">
            <AvatarImage src={userInfo.picture} alt="User Avatar" />
            <AvatarFallback>{user.username.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
        <p className="text-sm font-medium text-primary">{message?.role === Role.User ? user.username : 'Superflex'}</p>
      </div>

      {renderContent()}

      {showFeedback && (
        <div className="mt-4">
          <FeedbackDialog onFeedback={(feedback) => handleFeedback(message, feedback)} />
        </div>
      )}
    </div>
  );
};
