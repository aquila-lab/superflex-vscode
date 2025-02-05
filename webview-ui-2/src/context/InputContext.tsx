import {
  createContext,
  useContext,
  useMemo,
  ReactNode,
  useState,
  useRef,
  SetStateAction,
  RefObject,
  useCallback
} from 'react';

export interface InputContextValue {
  input: string;
  inputRef: RefObject<HTMLTextAreaElement | null>
  setInput: (value: SetStateAction<string>) => void;
  focusInput: () => void;
}

export const InputContext = createContext<InputContextValue | null>(null);

export const InputProvider = ({ text, children }: { text?: string; children: ReactNode }) => {
  const [input, setInput] = useState(text ?? '');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const focusInput = useCallback(() => {
    inputRef.current?.focus();
  }, [inputRef.current]);

  const value: InputContextValue = useMemo(
    () => ({
      input,
      inputRef,
      setInput,
      focusInput
    }),
    [input, inputRef, setInput, focusInput]
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
