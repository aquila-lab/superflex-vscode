import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { ThreadItem } from './ThreadItem'

export const ThreadHistory = () => {
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
          <ThreadItem thread={thread} />
        </div>
      ))}
    </div>
  )
}
