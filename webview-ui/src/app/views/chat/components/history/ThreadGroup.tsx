import { useMemo } from 'react'
import type { Thread } from '../../../../../../../shared/model'
import { ThreadItem } from './ThreadItem'

interface ThreadGroupProps {
  title: string
  threads: Thread[]
  onSelect: (threadId: string) => void
  onDelete: (threadId: string) => void
}

export const ThreadGroup = ({
  title,
  threads,
  onSelect,
  onDelete
}: ThreadGroupProps) => {
  const sortedThreads = useMemo(() => {
    return [...threads].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  }, [threads])

  return (
    <div className='mb-3'>
      <h3 className='text-xxs font-medium text-muted-foreground px-2 mb-1'>
        {title}
      </h3>
      <div className='space-y-0.5'>
        {sortedThreads.map(thread => (
          <ThreadItemWrapper
            key={thread.id}
            thread={thread}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  )
}

const ThreadItemWrapper = ({
  thread,
  onSelect,
  onDelete
}: {
  thread: Thread
  onSelect: (threadId: string) => void
  onDelete: (threadId: string) => void
}) => {
  const handleSelect = useMemo(
    () => () => onSelect(thread.id),
    [onSelect, thread.id]
  )

  const handleDelete = useMemo(
    () => () => onDelete(thread.id),
    [onDelete, thread.id]
  )

  return (
    <div onClick={handleSelect}>
      <ThreadItem
        thread={thread}
        onDelete={handleDelete}
      />
    </div>
  )
}
