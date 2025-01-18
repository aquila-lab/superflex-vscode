import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';
import { Message } from '../../../shared/model';

interface MessagesContextValue {
  messages: Message[];
  addMessages: (messages: Message[]) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
}

const MessagesContext = createContext<MessagesContextValue | null>(null);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessages = useCallback((newMessages: Message[]) => {
    setMessages((prev) => [...prev, ...newMessages]);
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
