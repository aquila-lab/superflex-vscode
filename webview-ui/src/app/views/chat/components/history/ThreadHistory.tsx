import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { VirtualizedThreadList } from './VirtualizedThreadList'

export const ThreadHistory = () => {
  const { threads, selectThread } = useThreads()

  if (threads.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col mt-6'>
      <VirtualizedThreadList
        threads={threads}
        onSelect={selectThread}
      />
    </div>
  )
}
