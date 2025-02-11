import {
  type ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react'
import { useNavigate } from 'react-router-dom'
import type { Thread } from '../../../shared/model'
import {
  EventRequestType,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../shared/protocol'
import { useConsumeMessage } from '../hooks/useConsumeMessage'
import { usePostMessage } from '../hooks/usePostMessage'
import { NULL_UUID } from '../common/utils'
import { PageLoaderView } from '../pages/PageLoaderView'

const ThreadsContext = createContext<{
  threads: Thread[]
  currentThread: Thread | null
  selectThread: (threadId: string) => void
  threadKey: string
} | null>(null)

export const ThreadsProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const navigate = useNavigate()

  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false)
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [threadKey, setThreadKey] = useState(NULL_UUID)

  useEffect(() => {
    if (currentThread && currentThread.id !== threadKey) {
      setThreadKey(currentThread.id)
    }
  }, [currentThread, threadKey])

  const selectThread = useCallback(
    (threadId: string) => {
      postMessage(EventRequestType.FETCH_THREAD, {
        threadID: threadId
      })
    },
    [postMessage]
  )

  const handleThreads = useCallback(
    ({ command, payload }: TypedEventResponseMessage) => {
      switch (command) {
        case EventResponseType.FETCH_THREADS:
          setThreads(payload)
          setIsInitialFetchDone(true)
          break
        case EventResponseType.FETCH_THREAD:
          setCurrentThread(payload)
          break
        case EventResponseType.NEW_THREAD:
          setCurrentThread(payload)
          postMessage(EventRequestType.STOP_MESSAGE)
          navigate('/chat', { replace: true })
          break
      }
    },
    [navigate, postMessage]
  )

  const fetchThreads = useCallback(() => {
    postMessage(EventRequestType.FETCH_THREADS)
  }, [postMessage])

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  useConsumeMessage(
    [
      EventResponseType.FETCH_THREADS,
      EventResponseType.FETCH_THREAD,
      EventResponseType.NEW_THREAD
    ],
    handleThreads
  )

  const value = useMemo(
    () => ({ threads, currentThread, threadKey, selectThread }),
    [threads, currentThread, threadKey, selectThread]
  )

  return (
    <ThreadsContext.Provider value={value}>
      {isInitialFetchDone ? children : <PageLoaderView />}
    </ThreadsContext.Provider>
  )
}

export function useThreads() {
  const context = useContext(ThreadsContext)

  if (!context) {
    throw new Error('Threads context provider not set')
  }

  return context
}
