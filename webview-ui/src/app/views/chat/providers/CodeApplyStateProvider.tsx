import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import type { ApplyState } from '../../../../common/utils'

type ApplyStateData = {
  state: ApplyState
  isAwaiting: boolean
}

const CodeApplyStateContext = createContext<{
  getApplyState: (filePath: string) => ApplyStateData
  setApplyState: (
    filePath: string,
    state: ApplyState,
    isAwaiting: boolean
  ) => void
  resetApplyState: (filePath: string) => void
} | null>(null)

export const CodeApplyStateProvider = ({
  children
}: { children: ReactNode }) => {
  const [applyStates, setApplyStates] = useState<
    Record<string, ApplyStateData>
  >({})

  const getApplyState = useCallback(
    (filePath: string): ApplyStateData => {
      return applyStates[filePath] || { state: 'idle', isAwaiting: false }
    },
    [applyStates]
  )

  const setApplyState = useCallback(
    (filePath: string, state: ApplyState, isAwaiting: boolean) => {
      setApplyStates(prev => ({
        ...prev,
        [filePath]: { state, isAwaiting }
      }))
    },
    []
  )

  const resetApplyState = useCallback((filePath: string) => {
    setApplyStates(prev => {
      const newStates = { ...prev }
      delete newStates[filePath]
      return newStates
    })
  }, [])

  const value = useMemo(
    () => ({
      getApplyState,
      setApplyState,
      resetApplyState
    }),
    [getApplyState, setApplyState, resetApplyState]
  )

  return (
    <CodeApplyStateContext.Provider value={value}>
      {children}
    </CodeApplyStateContext.Provider>
  )
}

export const useCodeApplyState = () => {
  const context = useContext(CodeApplyStateContext)

  if (!context) {
    throw new Error(
      'useCodeApplyState must be used within CodeApplyStateProvider'
    )
  }

  return context
}
