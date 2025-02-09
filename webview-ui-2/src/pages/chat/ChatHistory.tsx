import { useMemo } from 'react'
import { formatDistanceToNow } from 'date-fns'
import type { Thread } from '../../../../shared/model'
import { useThreads } from '../../context/ThreadsProvider'

const ChatThreadItem = ({ thread }: { thread: Thread }) => {
  const duration = useMemo(() => {
    return formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: false })
  }, [thread.updatedAt])

  return (
    <div className='group flex justify-between items-center gap-10 p-2 rounded-md cursor-pointer hover:bg-muted'>
      <div className='min-w-0 flex-1'>
        <p className='text-sm font-medium text-foreground truncate pr-2'>
          {thread.title}
        </p>
      </div>
      <span className='text-xs text-muted-foreground whitespace-nowrap'>
        {duration} ago
      </span>
    </div>
  )
}

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
          <div key={thread.id} onClick={() => selectThread(thread.id)}>
            <ChatThreadItem thread={thread} />
          </div>
        ))}
      </div>

      {/* {threads.length > 5 && (
        <Button
          variant='link'
          size='sm'
          className='text-muted-foreground hover:text-button-secondary-foreground mt-2'
        >
          Show {threads.length - 5} more...
        </Button>
      )} */}
    </div>
  )
}
