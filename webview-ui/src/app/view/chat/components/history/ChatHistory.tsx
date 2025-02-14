import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { ChatThreadItem } from './ChatThreadItem'

export const ChatHistory = () => {
  const { threads, selectThread } = useThreads()

  if (threads.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col px-1 mt-6 gap-y-1'>
      {threads.slice(0, 5).map(thread => (
        <div
          key={thread.id}
          onClick={() => selectThread(thread.id)}
        >
          <ChatThreadItem thread={thread} />
        </div>
      ))}
    </div>
  )
}
