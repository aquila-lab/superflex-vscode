import React, { useEffect, useRef } from 'react';
import { useAppSelector } from '../../core/store';
import { LoadingDots } from '../ui/LoadingDots';
import { ChatMessage } from './ChatMessage';

export const ChatMessageList: React.FC = () => {
  const messages = useAppSelector((state) => state.chat.messages);
  const isMessageProcessing = useAppSelector((state) => state.chat.isMessageProcessing);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col gap-y-2 mb-4 overflow-hidden">
      <ul ref={listRef} className="flex flex-col gap-y-2 overflow-y-auto">
        {messages.map((message) => (
          <li key={message.id}>
            <ChatMessage message={message} />
          </li>
        ))}
      </ul>

      {isMessageProcessing && (
        <div className="flex-1 mt-3 ml-2">
          <LoadingDots isLoading={true} />
        </div>
      )}
    </div>
  );
};
