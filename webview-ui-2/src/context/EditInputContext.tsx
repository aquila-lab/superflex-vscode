import {
  createContext,
  useMemo,
  ReactNode,
  useState,
  useCallback,
  useRef,
  RefObject,
  SetStateAction,
  useContext
} from 'react';
import { InputContextValue } from '../common/utils';

export const EditInputContext = createContext<InputContextValue | null>(null);

export const EditInputProvider = ({
  isDisabled: _isDisabled,
  stopMessage: _stopMessage,
  sendUserMessage: _sendUserMessage,
  replaceWithPaste: _replaceWithPaste,
  children
}: {
  isDisabled: boolean;
  stopMessage: (setInput: (value: SetStateAction<string>) => void, inputRef: RefObject<HTMLTextAreaElement>) => void;
  sendUserMessage: (input: string, setInput: (value: SetStateAction<string>) => void, messageId?: string) => Promise<void>;
  replaceWithPaste: (setInput: (value: SetStateAction<string>) => void, pastedText: string) => void;
  children: ReactNode;
}) => {
  const isDisabled = false;
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stopMessage = useCallback(() => {
    _stopMessage(setInput, inputRef);
  }, []);

  const sendUserMessage = useCallback(async (messageId?: string) => {
    _sendUserMessage(input, setInput, messageId);
  }, [input]);

  const replaceWithPaste = useCallback((pastedText: string) => {
    _replaceWithPaste(setInput, pastedText);
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

  return <EditInputContext.Provider value={value}>{children}</EditInputContext.Provider>;
};

export function useEditInput() {
  const context = useContext(EditInputContext);

  if (!context) {
    throw new Error('EditInput context provider not set');
  }

  return context;
}
