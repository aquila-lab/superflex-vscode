import { useThreads } from '../../context/ThreadsProvider'
import { ChatThreadItem } from './ChatThreadItem'

export const ChatHistory = () => {
  const { threads, selectThread } = useThreads()

  if (threads.length === 0) {
    return null
  }

  console.log(threads)

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
