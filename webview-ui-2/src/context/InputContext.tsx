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

export interface InputContextValue {
  input: string;
  isDisabled: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  setInput: (value: SetStateAction<string>) => void;
  sendUserMessage: () => Promise<void>;
  replaceWithPaste: (pastedText: string) => void;
  stopMessage: () => void;
}

export const InputContext = createContext<InputContextValue | null>(null);

export const InputProvider = ({
  isDisabled,
  stopMessage: _stopMessage,
  sendUserMessage: _sendUserMessage,
  replaceWithPaste: _replaceWithPaste,
  children
}: {
  isDisabled: boolean;
  stopMessage: (setInput: (value: SetStateAction<string>) => void, inputRef: RefObject<HTMLTextAreaElement>) => void;
  sendUserMessage: (input: string, setInput: (value: SetStateAction<string>) => void) => Promise<void>;
  replaceWithPaste: (setInput: (value: SetStateAction<string>) => void, pastedText: string) => void;
  children: ReactNode;
}) => {
  const [input, setInput] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const stopMessage = useCallback(() => {
    _stopMessage(setInput, inputRef);
  }, []);

  const sendUserMessage = useCallback(async () => {
    _sendUserMessage(input, setInput);
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

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>;
};

export function useInput() {
  const context = useContext(InputContext);

  if (!context) {
    throw new Error('Input context provider not set');
  }

  return context;
}
