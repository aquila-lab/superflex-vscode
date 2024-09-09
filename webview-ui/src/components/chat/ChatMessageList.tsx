import React from 'react';

import { useAppSelector } from '../../core/store';
import { ChatMessage } from './ChatMessage';

export const ChatMessageList: React.FC = () => {
  const messages = useAppSelector((state) => state.chat.messages);

  return (
    <div className="flex-1 flex flex-col justify-start overflow-y-auto mb-4">
      {messages.map((message) => (
        <ChatMessage key={message.id} message={message} />
      ))}
    </div>
  );
};
