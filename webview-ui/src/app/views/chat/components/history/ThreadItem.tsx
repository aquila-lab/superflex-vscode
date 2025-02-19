import { formatDistanceToNow } from 'date-fns'
import { useMemo } from 'react'
import type { Thread } from '../../../../../../../shared/model'
import { DeleteThreadButton } from './DeleteThreadButton'

export const ThreadItem = ({
  thread,
  onDelete
}: {
  thread: Thread
  onDelete: () => void
}) => {
  const duration = useMemo(() => {
    return formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: false })
  }, [thread.updatedAt])

  return (
    <div className='group flex justify-between items-center gap-6 p-2 rounded-md cursor-pointer hover:bg-muted'>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium text-foreground truncate pr-2'>
          {thread.title}
        </p>
      </div>
      <div className='flex items-center gap-2'>
        <span className='text-xs text-muted-foreground whitespace-nowrap'>
          {duration} ago
        </span>
        <DeleteThreadButton onDelete={onDelete} />
      </div>
    </div>
  )
}
