import React from 'react';

import { useAppSelector } from '../../core/store';
import { LoadingDots } from '../ui/LoadingDots';
import { ChatMessage } from './ChatMessage';

export const ChatMessageList: React.FC = () => {
  const messages = useAppSelector((state) => state.chat.messages);
  const isMessageProcessing = useAppSelector((state) => state.chat.isMessageProcessing);

  return (
    <div className="flex-1 flex flex-col justify-start gap-y-2 overflow-y-auto mb-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}

      <div className="mt-3 ml-2">
        <LoadingDots isLoading={isMessageProcessing} />
      </div>
    </div>
  );
};
