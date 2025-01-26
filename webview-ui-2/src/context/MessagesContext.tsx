import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Message, MessageType, Role } from '../../../shared/model';
import { useThreads } from './ThreadsProvider';

interface MessagesContextValue {
  messages: Message[];
  addMessages: (messages: Message[]) => void;
  updateUserMessage: (messageId: string, text: string) => void;
  popMessage: () => void;
  getMessage: (messageId: string) => Message | undefined;
  removeMessagesFrom: (messageId: string) => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

const DEFAULT_WELCOME_MESSAGE: Message = {
  id: 'welcome',
  threadID: 'welcome',
  role: Role.Assistant,
  content: {
    type: MessageType.Text,
    text: "Welcome to Superflex! I'm here to help turn your ideas into reality in seconds. Let's work together and get things done—tell me what you'd like to build today!"
  },
  createdAt: new Date(),
  updatedAt: new Date()
};

interface MessagesProviderProps {
  children: ReactNode;
}

export const MessagesProvider = ({ children }: MessagesProviderProps) => {
  const { currentThread } = useThreads();
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);

  useEffect(() => {
    if (currentThread) {
      setMessages(currentThread.messages);
    } else {
      setMessages([DEFAULT_WELCOME_MESSAGE]);
    }
  }, [currentThread]);

  const removeMessagesFrom = useCallback((messageId: string) => {
    setMessages((prev) => {
      const messageIndex = prev.findIndex((msg) => msg.id === messageId);
      if (messageIndex === -1) return prev;
      return prev.slice(0, messageIndex);
    });
  }, []);

  const getMessage = useCallback(
    (messageId: string) => {
      return messages.find((message) => message.id === messageId);
    },
    [messages]
  );

  const popMessage = useCallback(() => {
    setMessages((prev) => prev.slice(0, -1));
  }, []);

  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages((prev) => {
      if (prev.length === 0) {
        return newMessages;
      }
      return [...prev, ...newMessages];
    });
  }, []);

  const updateUserMessage = useCallback((messageId: string, text: string) => {
    setMessages((prev) =>
      prev.map((message) => {
        if (message.id === messageId && message.role === Role.User) {
          return {
            ...message,
            content: {
              type: MessageType.Text,
              text
            },
            updatedAt: new Date()
          };
        }
        return message;
      })
    );
  }, []);

  const value = useMemo(
    () => ({
      messages,
      addMessages,
      updateUserMessage,
      popMessage,
      getMessage,
      removeMessagesFrom
    }),
    [messages, addMessages, updateUserMessage, popMessage, getMessage, removeMessagesFrom]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export const useMessages = () => {
  const context = useContext(MessagesContext);

  if (!context) throw new Error('useMessages must be used within MessagesProvider');

  return context;
};
