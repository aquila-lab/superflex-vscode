import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Message, MessageContent, MessageType, Role, TextDelta } from '../../../shared/model';
import {
  EventRequestType,
  EventResponseMessage,
  EventResponsePayload,
  EventResponseType,
  FilePayload,
  SendMessagesRequestPayload
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
  sendMessageContent: (content: MessageContent[], files: FilePayload[]) => void;
  stopStreaming: () => void;
}

const NewMessageContext = createContext<NewMessageContextValue | null>(null);

export const NewMessageProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  const [message, setMessage] = useState<Message | null>(null);
  const [streamTextDelta, setStreamTextDelta] = useState('');
  const [isMessageProcessing, setIsMessageProcessing] = useState(false);
  const [isMessageStreaming, setIsMessageStreaming] = useState(false);
  const { messages, addMessages, popMessage } = useMessages();
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
    (payload: TextDelta) => {
      if (hasMessageStopped) return;
      if (!isMessageStreaming) setIsMessageStreaming(true);
      setStreamTextDelta((prev) => prev + payload.value);

      setMessage((prev) => {
        if (!prev) {
          return {
            id: uuidv4(),
            threadID: messages[0]?.threadID || uuidv4(),
            role: Role.Assistant,
            content: {
              type: MessageType.TextDelta,
              value: payload.value
            },
            createdAt: new Date(),
            updatedAt: new Date()
          };
        }

        return {
          ...prev,
          content: {
            type: MessageType.TextDelta,
            value: streamTextDelta + payload.value
          },
          updatedAt: new Date()
        };
      });
    },
    [messages, streamTextDelta, isMessageStreaming, hasMessageStopped]
  );

  const handleSendMessageResponse = useCallback(
    (payload: Message | null) => {
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
        case EventResponseType.SEND_MESSAGE: {
          handleSendMessageResponse(payload as EventResponsePayload[typeof event.command]);
        }
      }
    },
    [handleMessageDelta, handleSendMessageResponse]
  );

  useConsumeMessage([EventResponseType.MESSAGE_TEXT_DELTA, EventResponseType.SEND_MESSAGE], handleMessage);

  const sendMessageContent = useCallback(
    (content: MessageContent[], files: FilePayload[]): void => {
      if (content.length === 0) return;

      setHasMessageStopped(false);
      setIsMessageProcessing(true);

      const userMessage: Message = {
        id: uuidv4(),
        threadID: messages[0]?.threadID || uuidv4(),
        role: Role.User,
        content: content[0],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      addMessages([userMessage]);

      if (userMessage.content.type === MessageType.Text) {
        setLastUserMessage(userMessage.content.text);
      }

      const payload: SendMessagesRequestPayload = {
        messages: content,
        files
      };

      postMessage(EventRequestType.SEND_MESSAGE, payload);
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
