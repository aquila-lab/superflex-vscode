import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import {
  EventRequestType,
  EventResponseType
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'

const EnhancePromptContext = createContext<{
  isEnhancePromptEnabled: boolean
  toggleEnhancePrompt: () => void
} | null>(null)

export const EnhancePromptProvider = ({
  children
}: { children: ReactNode }) => {
  const [isEnhancePromptEnabled, setIsEnhancePromptEnabled] = useState(true)
  const postMessage = usePostMessage()

  const fetchEnhancePromptState = useCallback(() => {
    postMessage(EventRequestType.GET_ENHANCE_PROMPT_STATE)
  }, [postMessage])

  const toggleEnhancePrompt = useCallback(() => {
    const newState = !isEnhancePromptEnabled
    postMessage(EventRequestType.SET_ENHANCE_PROMPT_STATE, {
      enabled: newState
    })
  }, [isEnhancePromptEnabled, postMessage])

  const handleGetEnhancePromptState = useCallback(
    (response: { payload: boolean }) => {
      setIsEnhancePromptEnabled(response.payload)
    },
    []
  )

  useEffect(() => {
    fetchEnhancePromptState()
  }, [fetchEnhancePromptState])

  useConsumeMessage(
    [
      EventResponseType.GET_ENHANCE_PROMPT_STATE,
      EventResponseType.SET_ENHANCE_PROMPT_STATE
    ],
    handleGetEnhancePromptState
  )

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
