import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'

const EnhancePromptContext = createContext<{
  isEnhancePromptEnabled: boolean
  toggleEnhancePrompt: () => void
} | null>(null)

export const EnhancePromptProvider = ({
  children
}: { children: ReactNode }) => {
  const [isEnhancePromptEnabled, setIsEnhancePromptEnabled] = useState(true)

  const toggleEnhancePrompt = useCallback(() => {
    setIsEnhancePromptEnabled(prev => !prev)
  }, [])

  const value = useMemo(
    () => ({
      isEnhancePromptEnabled,
      toggleEnhancePrompt
    }),
    [isEnhancePromptEnabled, toggleEnhancePrompt]
  )

  return (
    <EnhancePromptContext.Provider value={value}>
      {children}
    </EnhancePromptContext.Provider>
  )
}

export const useEnhancePrompt = () => {
  const context = useContext(EnhancePromptContext)

  if (!context) {
    throw new Error(
      'useEnhancePrompt must be used within EnhancePromptProvider'
    )
  }

  return context
}
