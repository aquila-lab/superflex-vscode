import React, { useEffect, useRef, useState, memo } from 'react';
import { useAppSelector } from '../../core/store';
import { LoadingDots } from '../ui/LoadingDots';
import { ChatMessage } from './ChatMessage';
import { Message } from '../../../../shared/model';

interface ChatMessageListProps {
  handleMessageFeedback: (message: Message, feedback: string) => void;
}

// Use memo to prevent re-rendering of the ChatMessage component that was not updated
const MemoizedChatMessage = memo(ChatMessage);

export const ChatMessageList: React.FC<ChatMessageListProps> = ({ handleMessageFeedback }) => {
  const listRef = useRef<HTMLUListElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const messages = useAppSelector((state) => state.chat.messages);
  const isMessageStreaming = useAppSelector((state) => state.chat.isMessageStreaming);
  const isMessageProcessing = useAppSelector((state) => state.chat.isMessageProcessing);

  const scrollToBottom = () => {
    if (listRef.current && shouldAutoScroll) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (listRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10; // 10px threshold
      setShouldAutoScroll(isAtBottom);
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-y-2 mb-4 -mt-4 overflow-hidden">
      <ul ref={listRef} className="flex flex-col gap-y-2 overflow-y-auto" onScroll={handleScroll}>
        {messages.map((message) => (
          <li key={message.id}>
            <MemoizedChatMessage message={message} handleFeedback={handleMessageFeedback} />
          </li>
        ))}
      </ul>

      {isMessageProcessing && !isMessageStreaming && (
        <div className="flex-1 mt-3 ml-2">
          <LoadingDots isLoading={true} />
        </div>
      )}
    </div>
  );
};
