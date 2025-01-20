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

interface InputContextValue {
  input: string;
  isDisabled: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  setInput: (value: SetStateAction<string>) => void;
  sendUserMessage: () => Promise<void>;
  replaceWithPaste: (text: string) => Promise<boolean>;
}

const InputContext = createContext<InputContextValue | null>(null);

export const InputProvider = ({ children }: { children: ReactNode }) => {
  const [input, setInput] = useState('');
  const { sendMessageContent, isMessageProcessing } = useNewMessage();
  const isDisabled = isMessageProcessing; // TODO || isProjectSyncing || !initState.isInitialized || isFigmaFileLoading
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const sendUserMessage = useCallback(async () => {
    if (!input.trim()) return;

    const success = await sendMessageContent([{ type: MessageType.Text, text: input.trim() }], []);

    if (success) {
      setInput('');
    }
  }, [input, sendMessageContent]);

  const replaceWithPaste = useCallback(async (text: string) => {
    // TODO
    return true;
  }, []);

  const value: InputContextValue = useMemo(
    () => ({
      input,
      isDisabled,
      inputRef,
      setInput,
      sendUserMessage,
      replaceWithPaste
    }),
    [input, isDisabled, inputRef, setInput, sendUserMessage, replaceWithPaste]
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
