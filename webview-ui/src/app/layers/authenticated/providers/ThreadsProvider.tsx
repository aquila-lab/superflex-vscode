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
import type { Thread } from '../../../../../../shared/model'
import {
  EventRequestType,
  EventResponseType,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { NULL_UUID } from '../../../../common/utils'
import { LoadingView } from '../../../views/loading/LoadingView'
import { useConsumeMessage } from '../../global/hooks/useConsumeMessage'
import { usePostMessage } from '../../global/hooks/usePostMessage'

const ThreadsContext = createContext<{
  threads: Thread[]
  currentThread: Thread | null
  selectThread: (threadId: string) => void
  fetchThreads: () => void
  fetchMoreThreads: () => void
  threadKey: string
  hasMoreThreads: boolean
  isLoadingMore: boolean
  deleteThread: (threadId: string) => void
  renameThread: (threadId: string, newTitle: string) => void
} | null>(null)

export const ThreadsProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage()
  const navigate = useNavigate()

  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false)
  const [threads, setThreads] = useState<Thread[]>([])
  const [currentThread, setCurrentThread] = useState<Thread | null>(null)
  const [threadKey, setThreadKey] = useState(NULL_UUID)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const hasMoreThreads = useMemo(() => Boolean(nextCursor), [nextCursor])

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
    ({ command, payload, error }: TypedEventResponseMessage) => {
      if (error) {
        return
      }

      switch (command) {
        case EventResponseType.FETCH_THREADS:
          setThreads(prev => {
            if (payload.previousCursor) {
              return [...prev, ...payload.threads]
            }
            return payload.threads
          })
          setNextCursor(payload.nextCursor)
          setIsInitialFetchDone(true)
          setIsLoadingMore(false)
          break
        case EventResponseType.FETCH_THREAD:
          setCurrentThread(payload)
          break
        case EventResponseType.NEW_THREAD:
          setCurrentThread(payload)
          postMessage(EventRequestType.STOP_MESSAGE)
          navigate('/chat', { replace: true })
          break
        case EventResponseType.UPDATE_THREAD:
          setThreads(prev =>
            prev.map(thread =>
              thread.id === payload.id
                ? { ...thread, title: payload.title }
                : thread
            )
          )
          setCurrentThread(curr =>
            curr?.id === payload.id ? { ...curr, title: payload.title } : curr
          )
          break
        case EventResponseType.DELETE_THREAD:
          setThreads(prev =>
            prev.filter(thread => thread.id !== payload.threadID)
          )
          setCurrentThread(curr =>
            curr?.id === payload.threadID ? null : curr
          )
          break
      }
    },
    [navigate, postMessage]
  )

  const fetchThreads = useCallback(() => {
    postMessage(EventRequestType.FETCH_THREADS, {
      take: 10
    })
  }, [postMessage])

  const fetchMoreThreads = useCallback(() => {
    if (!nextCursor || isLoadingMore) {
      return
    }

    setIsLoadingMore(true)
    postMessage(EventRequestType.FETCH_THREADS, {
      cursor: nextCursor,
      take: 10
    })
  }, [nextCursor, isLoadingMore, postMessage])

  const deleteThread = useCallback(
    (threadId: string) => {
      postMessage(EventRequestType.DELETE_THREAD, {
        threadID: threadId
      })
    },
    [postMessage]
  )

  const renameThread = useCallback(
    (threadId: string, newTitle: string) => {
      postMessage(EventRequestType.UPDATE_THREAD, {
        threadID: threadId,
        title: newTitle
      })
    },
    [postMessage]
  )

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  useConsumeMessage(
    [
      EventResponseType.FETCH_THREADS,
      EventResponseType.FETCH_THREAD,
      EventResponseType.NEW_THREAD,
      EventResponseType.DELETE_THREAD,
      EventResponseType.UPDATE_THREAD
    ],
    handleThreads
  )

  const value = useMemo(
    () => ({
      threads,
      currentThread,
      threadKey,
      selectThread,
      fetchThreads,
      fetchMoreThreads,
      hasMoreThreads,
      isLoadingMore,
      deleteThread,
      renameThread
    }),
    [
      threads,
      currentThread,
      threadKey,
      selectThread,
      fetchThreads,
      fetchMoreThreads,
      hasMoreThreads,
      isLoadingMore,
      deleteThread,
      renameThread
    ]
  )

  return (
    <ThreadsContext.Provider value={value}>
      {isInitialFetchDone ? children : <LoadingView />}
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
