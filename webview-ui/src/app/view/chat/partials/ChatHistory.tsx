import { useThreads } from '../../../layer/authenticated/ThreadsProvider'
import { ChatThreadItem } from './ChatThreadItem'

export const ChatHistory = () => {
  const { threads, selectThread } = useThreads()

  if (threads.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col px-1 mt-6'>
      <h2 className='text-base font-medium mb-2'>Past workflows</h2>

      <div className='flex flex-col gap-y-1'>
        {threads.slice(0, 5).map(thread => (
          <div
            key={thread.id}
            onClick={() => selectThread(thread.id)}
          >
            <ChatThreadItem thread={thread} />
          </div>
        ))}
      </div>
    </div>
  )
}
