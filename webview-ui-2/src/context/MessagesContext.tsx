import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Message, MessageType, Role } from '../../../shared/model';

interface MessagesContextValue {
  messages: Message[];
  addMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
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

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([DEFAULT_WELCOME_MESSAGE]);

  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages((prev) => [...prev, ...newMessages].filter((message) => message.id !== 'welcome'));
  }, []);

  const updateMessage = useCallback((messageId: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg)));
  }, []);

  const value = useMemo(
    () => ({
      messages,
      addMessages,
      updateMessage
    }),
    [messages, addMessages, updateMessage]
  );

  return <MessagesContext.Provider value={value}>{children}</MessagesContext.Provider>;
};

export const useMessages = () => {
  const context = useContext(MessagesContext);

  if (!context) throw new Error('useMessages must be used within MessagesProvider');

  return context;
};
