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
  type EventRequestMessage,
  type EventRequestPayload,
  type EventRequestType,
  newEventRequest
} from '../../../shared/protocol'

interface VSCodeContextValue {
  postMessage: <T extends EventRequestType>(
    command: T,
    payload?: EventRequestPayload[T]
  ) => void
}

const VSCodeContext = createContext<VSCodeContextValue | null>(null)

export const VSCodeProvider = ({ children }: { children: ReactNode }) => {
  const [vscodeApi, setVscodeApi] = useState<VsCodeApi | null>(null)
  const [pendingTasks, setPendingTasks] = useState<
    EventRequestMessage<EventRequestType>[]
  >([])

  useEffect(() => {
    if (window?.acquireVsCodeApi) {
      setVscodeApi(window.acquireVsCodeApi())
    }
  }, [])

  useEffect(() => {
    if (vscodeApi) {
      pendingTasks.forEach(task => vscodeApi.postMessage(task))
      setPendingTasks([])
    }
  }, [vscodeApi])

  const postMessage = useCallback(
    <T extends EventRequestType>(
      command: T,
      payload?: EventRequestPayload[T]
    ) => {
      const message = newEventRequest(command, payload)
      if (!vscodeApi) {
        setPendingTasks(prev => [...prev, message])
      } else {
        vscodeApi.postMessage(message)
      }
    },
    [vscodeApi]
  )

  const value: VSCodeContextValue = useMemo(
    () => ({ postMessage }),
    [postMessage]
  )

  return (
    <VSCodeContext.Provider value={value}>{children}</VSCodeContext.Provider>
  )
}

export function useVSCode() {
  const context = useContext(VSCodeContext)

  if (!context) {
    throw new Error('VSCode context provider not set')
  }

  return context
}
