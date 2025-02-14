import { useMemo } from 'react'
import { List, AutoSizer } from 'react-virtualized'
import type { Thread } from '../../../../../../../shared/model'
import { ThreadItem } from './ThreadItem'

export const VirtualizedThreadList = ({
  threads,
  onSelect,
  onScroll
}: {
  threads: Thread[]
  onSelect: (threadId: string) => void
  onScroll: (position: number) => void
}) => {
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

  const handleScroll = ({ scrollTop }: { scrollTop: number }) => {
    onScroll(scrollTop)
  }

  return (
    <div className='h-[240px]'>
      <AutoSizer>
        {({ height, width }) => (
          <List
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
    </div>
  )
}
