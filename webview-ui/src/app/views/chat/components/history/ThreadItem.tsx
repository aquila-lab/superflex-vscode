import { formatDistanceToNow } from 'date-fns'
import { useMemo } from 'react'
import type { Thread } from '../../../../../../../shared/model'
import { useThreads } from '../../../../layers/authenticated/providers/ThreadsProvider'
import { DeleteThreadButton } from './DeleteThreadButton'
import { RenameThreadButton } from './RenameThreadButton'

export const ThreadItem = ({
  thread,
  onDelete
}: {
  thread: Thread
  onDelete: () => void
}) => {
  const { renameThread } = useThreads()

  const duration = useMemo(() => {
    return formatDistanceToNow(new Date(thread.updatedAt), { addSuffix: false })
  }, [thread.updatedAt])

  const handleRename = useMemo(
    () => (newTitle: string) => renameThread(thread.id, newTitle),
    [thread.id, renameThread]
  )

  return (
    <div className='group flex justify-between items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted h-10'>
      <div className='min-w-0 flex-grow'>
        <p className='text-xs font-medium text-foreground truncate pr-2'>
          {thread.title ?? 'Untitled'}
        </p>
      </div>
      <div className='w-0 group-hover:w-auto overflow-hidden flex-shrink-0'>
        <div className='flex items-center gap-1 whitespace-nowrap'>
          <span className='text-xs text-muted-foreground text-right'>
            {duration} ago
          </span>
          <div className='flex items-center'>
            <RenameThreadButton
              title={thread.title ?? 'Untitled'}
              onRename={handleRename}
            />
            <DeleteThreadButton onDelete={onDelete} />
          </div>
        </div>
      </div>
    </div>
  )
}
