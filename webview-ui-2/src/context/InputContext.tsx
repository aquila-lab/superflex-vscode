import {
  type Dispatch,
  type ReactNode,
  type RefObject,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState
} from 'react'

export const InputContext = createContext<{
  input: string
  messageId: string | null
  inputRef: RefObject<HTMLTextAreaElement | null>
  setMessageId: Dispatch<SetStateAction<string | null>>
  setInput: Dispatch<SetStateAction<string>>
  focusInput: () => void
} | null>(null)

export const InputProvider = ({
  text,
  id,
  children
}: { text?: string; id?: string; children: ReactNode }) => {
  const [input, setInput] = useState(text ?? '')
  const [messageId, setMessageId] = useState(id ?? null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const focusInput = useCallback(() => {
    inputRef.current?.focus()
  }, [])

  const value = useMemo(
    () => ({
      input,
      inputRef,
      messageId,
      setMessageId,
      setInput,
      focusInput
    }),
    [input, messageId, focusInput]
  )

  return <InputContext.Provider value={value}>{children}</InputContext.Provider>
}

export function useInput() {
  const context = useContext(InputContext)

  if (!context) {
    throw new Error('Input context provider not set')
  }

  return context
}
