import { useMemo, forwardRef, useState } from 'react'
import { List, AutoSizer } from 'react-virtualized'
import type { Thread } from '../../../../../../../shared/model'
import { ThreadItem } from './ThreadItem'
import { cn } from '../../../../../common/utils'

export const VirtualizedThreadList = forwardRef<
  List,
  {
    threads: Thread[]
    onSelect: (threadId: string) => void
    onScroll: (params: {
      scrollTop: number
      scrollHeight: number
      clientHeight: number
    }) => void
    isLoadingMore: boolean
  }
>(({ threads, onSelect, onScroll }, ref) => {
  const [showTopGradient, setShowTopGradient] = useState(false)
  const [showBottomGradient, setShowBottomGradient] = useState(true)

  const rowRenderer = useMemo(
    () =>
      ({
        index,
        key,
        style
      }: {
        index: number
        key: string
        style: object
      }) => (
        <div
          key={key}
          style={style}
          onClick={() => onSelect(threads[index].id)}
        >
          <ThreadItem thread={threads[index]} />
        </div>
      ),
    [threads, onSelect]
  )

  const handleScroll = ({
    scrollTop,
    scrollHeight,
    clientHeight
  }: { scrollTop: number; scrollHeight: number; clientHeight: number }) => {
    onScroll({ scrollTop, scrollHeight, clientHeight })

    setShowTopGradient(scrollTop > 20)
    setShowBottomGradient(scrollTop < scrollHeight - clientHeight - 20)
  }

  return (
    <div className='h-[240px] relative'>
      <AutoSizer>
        {({ height, width }) => (
          <List
            ref={ref}
            width={width}
            height={height}
            rowCount={threads.length}
            rowHeight={40}
            rowRenderer={rowRenderer}
            overscanRowCount={3}
            onScroll={handleScroll}
            scrollToAlignment='start'
            aria-label='Thread history'
            tabIndex={0}
            role='listbox'
            className='scrollbar-hide'
          />
        )}
      </AutoSizer>
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
  )
})

VirtualizedThreadList.displayName = 'VirtualizedThreadList'
