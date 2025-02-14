import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { VirtualizedThreadList } from './VirtualizedThreadList'
import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { useState } from 'react'

export const ThreadHistory = () => {
  const { threads, selectThread } = useThreads()
  const [scrollPosition, setScrollPosition] = useState(0)

  const currentPosition = Math.ceil(scrollPosition / 40) + 1
  const totalThreads = threads.length

  if (threads.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col mt-6'>
      <div className='flex items-center justify-between mb-2 px-2'>
        <div className='flex gap-2 items-baseline'>
          <h2 className='text-sm font-medium text-muted-foreground'>
            Recent Conversations
          </h2>
          <span className='text-xxs text-muted-secondary-foreground'>
            {currentPosition} / {totalThreads}
          </span>
        </div>
        <div className='flex items-center gap-0.5 text-muted-foreground text-sm'>
          <ChevronUpIcon className='size-3' />
          <ChevronDownIcon className='size-3' />
        </div>
      </div>
      <VirtualizedThreadList
        threads={threads}
        onSelect={selectThread}
        onScroll={setScrollPosition}
      />
    </div>
  )
}
