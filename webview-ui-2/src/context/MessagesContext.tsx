import { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from 'react';
import { Message, MessageType, Role } from '../../../shared/model';
import { useThreads } from './ThreadsProvider';

interface MessagesContextValue {
  messages: Message[];
  addMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  popMessage: () => void;
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

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)));
  }, []);

  const value = useMemo(
    () => ({
      messages,
      addMessages,
      updateMessage,
      popMessage
    }),
    [messages, addMessages, updateMessage, popMessage]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export const useMessages = () => {
  const context = useContext(MessagesContext);

  if (!context) throw new Error('useMessages must be used within MessagesProvider');

  return context;
};
