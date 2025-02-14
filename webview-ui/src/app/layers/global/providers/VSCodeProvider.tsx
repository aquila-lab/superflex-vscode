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
  type EventRequestType,
  type EventRequestPayload,
  type EventRequestMessage,
  newEventRequest
} from '../../../../../../shared/protocol'

const VSCodeContext = createContext<{
  postMessage: <T extends EventRequestType>(
    command: T,
    payload?: EventRequestPayload[T]
  ) => void
} | null>(null)

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
      pendingTasks.forEach(task => {
        console.warn('New task from event queue')
        console.dir(task)
        vscodeApi.postMessage(task)
      })
      setPendingTasks([])
    }
  }, [vscodeApi, pendingTasks.forEach])

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

  const value = useMemo(() => ({ postMessage }), [postMessage])

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
