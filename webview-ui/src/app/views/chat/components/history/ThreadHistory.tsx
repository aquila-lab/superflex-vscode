import { useCallback, useMemo, useRef, useState } from 'react'
import { categorizeThreadsByDate, cn } from '../../../../../common/utils'
import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { ThreadGroup } from './ThreadGroup'

export const ThreadHistory = () => {
  const {
    threads,
    selectThread,
    deleteThread,
    hasMoreThreads,
    fetchMoreThreads,
    isLoadingMore
  } = useThreads()

  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(true)

  const categorizedThreads = useMemo(() => {
    return categorizeThreadsByDate(threads)
  }, [threads])

  const orderedGroups = useMemo(() => {
    const groupOrder = [
      'Today',
      'Yesterday',
      'Previous 7 days',
      'Previous 30 days'
    ]

    const groups = Object.keys(categorizedThreads)

    return groups.sort((a, b) => {
      const aIndex = groupOrder.indexOf(a)
      const bIndex = groupOrder.indexOf(b)

      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex
      }

      if (aIndex !== -1) {
        return -1
      }

      if (bIndex !== -1) {
        return 1
      }

      return b.localeCompare(a)
    })
  }, [categorizedThreads])

  const containerRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    if (!containerRef.current) {
      return
    }

    const { scrollTop, scrollHeight, clientHeight } = containerRef.current

    setShowTopGradient(scrollTop > 20)
    setShowBottomGradient(scrollTop < scrollHeight - clientHeight - 20)

    if (
      hasMoreThreads &&
      !isLoadingMore &&
      scrollHeight - scrollTop - clientHeight < 300
    ) {
      fetchMoreThreads()
    }
  }, [hasMoreThreads, isLoadingMore, fetchMoreThreads])

  if (threads.length === 0) {
    return null
  }

  return (
    <div className='flex flex-col mt-6'>
      <div className='relative h-[240px]'>
        <div
          ref={containerRef}
          className='h-full overflow-y-auto scrollbar-hide'
          onScroll={handleScroll}
        >
          {orderedGroups.map(group => (
            <ThreadGroup
              key={group}
              title={group}
              threads={categorizedThreads[group]}
              onSelect={selectThread}
              onDelete={deleteThread}
            />
          ))}
          {isLoadingMore && (
            <div className='text-xs text-center text-muted-foreground py-2'>
              Loading more...
            </div>
          )}
        </div>
        <div
          className={cn(
            'absolute top-0 left-0 right-0 h-14 pointer-events-none bg-gradient-to-b from-sidebar to-transparent transition-opacity duration-200',
            showTopGradient ? 'opacity-80' : 'opacity-0'
          )}
        />
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 h-14 pointer-events-none bg-gradient-to-t from-sidebar to-transparent transition-opacity duration-200',
            showBottomGradient ? 'opacity-80' : 'opacity-0'
          )}
        />
      </div>
    </div>
  )
}
