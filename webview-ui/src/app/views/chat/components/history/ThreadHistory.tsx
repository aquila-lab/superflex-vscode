import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { VirtualizedThreadList } from './VirtualizedThreadList'
import { ChevronUpIcon, ChevronDownIcon } from '@radix-ui/react-icons'
import { useCallback, useRef } from 'react'
import { Button } from '../../../../../common/ui/Button'
import type { List } from 'react-virtualized'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../../../../common/ui/Tooltip'

export const ThreadHistory = () => {
  const {
    threads,
    selectThread,
    deleteThread,
    hasMoreThreads,
    fetchMoreThreads,
    isLoadingMore
  } = useThreads()
  const listRef = useRef<List | null>(null)

  const handleScrollToTop = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToPosition(0)
    }
  }, [])

  const handleScrollToBottom = useCallback(() => {
    if (listRef.current) {
      listRef.current.scrollToPosition(Number.MAX_SAFE_INTEGER)
    }
  }, [])

  const handleScroll = useCallback(
    ({
      scrollTop,
      scrollHeight,
      clientHeight
    }: {
      scrollTop: number
      scrollHeight: number
      clientHeight: number
    }) => {
      if (
        hasMoreThreads &&
        !isLoadingMore &&
        scrollHeight - scrollTop - clientHeight < 300
      ) {
        fetchMoreThreads()
      }
    },
    [hasMoreThreads, isLoadingMore, fetchMoreThreads]
  )

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
        </div>
        <div className='flex items-center gap-0.5 text-muted-foreground text-sm'>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant='text'
                  size='icon'
                  onClick={handleScrollToTop}
                  className='hover:text-foreground w-auto h-auto'
                  aria-label='Scroll to top'
                >
                  <ChevronUpIcon className='size-3' />
                </Button>
              </TooltipTrigger>
              <TooltipContent portal>
                <p className='text-xs m-0 text-muted-foreground'>Show recent</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='text'
                size='icon'
                onClick={handleScrollToBottom}
                className='hover:text-foreground w-auto h-auto'
                aria-label='Scroll to bottom'
              >
                <ChevronDownIcon className='size-3' />
              </Button>
            </TooltipTrigger>
            <TooltipContent portal>
              <p className='text-xs m-0 text-muted-foreground'>Show older</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      <VirtualizedThreadList
        ref={listRef}
        threads={threads}
        onSelect={selectThread}
        onDelete={deleteThread}
        onScroll={handleScroll}
        isLoadingMore={isLoadingMore}
      />
    </div>
  )
}
