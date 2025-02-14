import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { VirtualizedThreadList } from './VirtualizedThreadList'
import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { useState, useCallback, useRef } from 'react'
import { Button } from '../../../../../common/ui/Button'
import type { List } from 'react-virtualized'

export const ThreadHistory = () => {
  const { threads, selectThread } = useThreads()
  const [scrollPosition, setScrollPosition] = useState(0)
  const listRef = useRef<List | null>(null)

  const currentPosition = Math.ceil(scrollPosition / 40) + 1
  const totalThreads = threads.length

  const handleScrollToTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToRow(0)
    }
  }, [])

  const handleScrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToRow(threads.length - 1)
    }
  }, [threads.length])

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
          <Button
            variant='text'
            size='icon'
            onClick={handleScrollToTop}
            className='hover:text-foreground w-auto h-auto'
            aria-label='Scroll to top'
          >
            <ChevronUpIcon className='size-3' />
          </Button>
          <Button
            variant='text'
            size='icon'
            onClick={handleScrollToBottom}
            className='hover:text-foreground w-auto h-auto'
            aria-label='Scroll to bottom'
          >
            <ChevronDownIcon className='size-3' />
          </Button>
        </div>
      </div>
      <VirtualizedThreadList
        ref={listRef}
        threads={threads}
        onSelect={selectThread}
        onScroll={setScrollPosition}
      />
    </div>
  )
}
