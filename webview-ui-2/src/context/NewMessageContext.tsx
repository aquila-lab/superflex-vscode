import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Message, MessageContent, Role } from '../../../shared/model';
import {
  EventRequestType,
  EventResponseMessage,
  EventResponsePayload,
  EventResponseType
} from '../../../shared/protocol';
import { useConsumeMessage } from '../hooks/useConsumeMessage';
import { usePostMessage } from '../hooks/usePostMessage';
import { useMessages } from './MessagesContext';
import { v4 as uuidv4 } from 'uuid';

interface NewMessageContextValue {
  message: Message | null;
  isMessageProcessing: boolean;
  isMessageStreaming: boolean;
  hasMessageStopped: boolean;
  lastUserMessage: string | null;
  sendMessageContent: (content: MessageContent) => void;
  stopStreaming: () => void;
}

const NewMessageContext = createContext<NewMessageContextValue | null>(null);

export const NewMessageProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  const { messages, addMessages, popMessage, removeMessagesFrom } = useMessages();

  const [message, setMessage] = useState<Message | null>(null);
  const [streamTextDelta, setStreamTextDelta] = useState('');
  const [isMessageProcessing, setIsMessageProcessing] = useState(false);
  const [isMessageStreaming, setIsMessageStreaming] = useState(false);
  const [hasMessageStopped, setHasMessageStopped] = useState(false);
  const [lastUserMessage, setLastUserMessage] = useState<string | null>(null);

  const resetNewMessage = useCallback(() => {
    setIsMessageStreaming(false);
    setIsMessageProcessing(false);
    setMessage(null);
    setStreamTextDelta('');
  }, []);

  const stopStreaming = useCallback(() => {
    postMessage(EventRequestType.STOP_MESSAGE);
    resetNewMessage();
    popMessage();
  }, [postMessage, resetNewMessage]);

  const handleMessageDelta = useCallback(
    (payload: string) => {
      if (hasMessageStopped) return;
      if (!isMessageStreaming) setIsMessageStreaming(true);
      setStreamTextDelta((prev) => prev + payload);

      setMessage((prev) => {
        if (!prev) {
          return {
            id: uuidv4(),
            threadID: messages[0]?.threadID || uuidv4(),
            role: Role.Assistant,
            content: {
              text: payload
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        return {
          ...prev,
          content: {
            text: streamTextDelta + payload
          },
          updatedAt: new Date()
        };
      });
    },
    [messages, streamTextDelta, isMessageStreaming, hasMessageStopped]
  );

  const handleSendMessageResponse = useCallback(
    (payload: Message) => {
      console.log(payload);

      setIsMessageProcessing(false);
      setIsMessageStreaming(false);

      if (!payload) {
        setMessage(null);
        setStreamTextDelta('');
        return;
      }

      addMessages([payload]);

      setMessage(null);
      setStreamTextDelta('');
    },
    [addMessages, setMessage]
  );

  const handleMessage = useCallback(
    (payload: EventResponsePayload[EventResponseType], event: EventResponseMessage<EventResponseType>) => {
      switch (event.command) {
        case EventResponseType.MESSAGE_TEXT_DELTA: {
          handleMessageDelta(payload as EventResponsePayload[typeof event.command]);
          break;
        }
        case EventResponseType.MESSAGE_COMPLETE: {
          handleSendMessageResponse(payload as EventResponsePayload[typeof event.command]);
        }
      }
    },
    [handleMessageDelta, handleSendMessageResponse]
  );

  useConsumeMessage([EventResponseType.MESSAGE_TEXT_DELTA, EventResponseType.MESSAGE_COMPLETE], handleMessage);

  const sendMessageContent = useCallback(
    (content: MessageContent): void => {
      console.log(content);
      if (!content.text && !content.attachment) return;

      const userMessage: Message = {
        id: uuidv4(),
        threadID: messages[0]?.threadID || uuidv4(),
        role: Role.User,
        content,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      if (content.fromMessageID) {
        stopStreaming();
        removeMessagesFrom(content.fromMessageID);
      }

      setHasMessageStopped(false);
      setIsMessageProcessing(true);
      addMessages([userMessage]);

      if (userMessage.content.text) {
        setLastUserMessage(userMessage.content.text);
      }

      postMessage(EventRequestType.SEND_MESSAGE, content);
    },
    [postMessage, messages, addMessages]
  );

  const value = useMemo(
    () => ({
      message,
      isMessageProcessing,
      isMessageStreaming,
      hasMessageStopped,
      lastUserMessage,
      sendMessageContent,
      stopStreaming
    }),
    [
      message,
      isMessageProcessing,
      isMessageStreaming,
      hasMessageStopped,
      lastUserMessage,
      sendMessageContent,
      stopStreaming
    ]
  );

  return <NewMessageContext.Provider value={value}>{children}</NewMessageContext.Provider>;
};

export const useNewMessage = () => {
  const context = useContext(NewMessageContext);

  if (!context) throw new Error('useNewMessage must be used within NewMessageProvider');

  return context;
};
