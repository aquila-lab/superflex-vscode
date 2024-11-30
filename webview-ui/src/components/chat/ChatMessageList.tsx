import React from 'react';
import ScrollToBottom from 'react-scroll-to-bottom';

import { Message } from '../../../../shared/model';
import { useAppSelector } from '../../core/store';
import { LoadingDots } from '../ui/LoadingDots';
import { ChatMessage } from './ChatMessage';

interface ChatMessageListProps {
  handleMessageFeedback: (message: Message, feedback: string) => void;
  checkFileExists: (filePath: string) => Promise<boolean>;
  onFileNameClick: (filePath: string) => void;
  onApplyCodeClick: (filePath: string, code: string) => void;
}

export const ChatMessageList: React.FC<ChatMessageListProps> = ({
  handleMessageFeedback,
  checkFileExists,
  onFileNameClick,
  onApplyCodeClick
}) => {
  const messages = useAppSelector((state) => state.chat.messages);
  const isMessageStreaming = useAppSelector((state) => state.chat.isMessageStreaming);
  const isMessageProcessing = useAppSelector((state) => state.chat.isMessageProcessing);

  return (
    <div className="flex-1 flex flex-col gap-y-2 mb-4 -mt-4 overflow-hidden">
      <ScrollToBottom
        className="flex flex-col gap-y-2 overflow-y-auto"
        initialScrollBehavior="smooth"
        followButtonClassName="!bg-muted/50 hover:!bg-muted/80">
        {messages.map((message) => (
          <div key={message.id}>
            <ChatMessage
              message={message}
              handleFeedback={handleMessageFeedback}
              checkFileExists={checkFileExists}
              onFileNameClick={onFileNameClick}
              onApplyCodeClick={onApplyCodeClick}
            />
          </div>
        ))}

        {isMessageStreaming && (
          <div>
            <ChatMessage
              isStreaming={true}
              handleFeedback={handleMessageFeedback}
              checkFileExists={checkFileExists}
              onFileNameClick={onFileNameClick}
              onApplyCodeClick={onApplyCodeClick}
            />
          </div>
        )}
      </ScrollToBottom>

      {isMessageProcessing && !isMessageStreaming && (
        <div className="flex-1 mt-3 ml-2">
          <LoadingDots isLoading={true} />
        </div>
      )}
    </div>
  );
};
