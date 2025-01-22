import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useCallback,
  useRef,
  RefObject,
  SetStateAction
} from 'react';
import { useNewMessage } from './NewMessageContext';
import { MessageType } from '../../../shared/model';
import { useSync } from './SyncProvider';

interface InputContextValue {
  input: string;
  isDisabled: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  setInput: (value: SetStateAction<string>) => void;
  sendUserMessage: () => Promise<void>;
  replaceWithPaste: (pastedText: string) => void;
  stopMessage: () => void;
}

const InputContext = createContext<InputContextValue | null>(null);

export const InputProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState('');
  const { isSyncing } = useSync();
  const { sendMessageContent, isMessageProcessing, stopStreaming, lastUserMessage } =
    useNewMessage();
  const isDisabled = isMessageProcessing || isSyncing; // TODO || !initState.isInitialized || isFigmaFileLoading
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stopMessage = useCallback(() => {
    if (lastUserMessage) {
      stopStreaming();
      setInput(lastUserMessage);
      inputRef.current?.focus();
    }
  }, [lastUserMessage]);

  const sendUserMessage = useCallback(async () => {
    if (!input.trim()) return;

    sendMessageContent([{ type: MessageType.Text, text: input.trim() }], []);
    setInput('');
  }, [input, sendMessageContent]);

  const replaceWithPaste = useCallback((pastedText: string) => {
    // TODO
    setInput(pastedText);
  }, []);

  const value: InputContextValue = useMemo(
    () => ({
      input,
      isDisabled,
      inputRef,
      setInput,
      sendUserMessage,
      replaceWithPaste,
      stopMessage
    }),
    [input, isDisabled, inputRef, setInput, sendUserMessage, replaceWithPaste, stopMessage]
  );

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
};

export function useInput() {
  const context = useContext(InputContext);

  if (!context) {
    throw new Error('Input context provider not set');
  }

  return context;
}
