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
    <div className='group flex justify-between items-center gap-6 p-2 rounded-md cursor-pointer hover:bg-muted'>
      <div className='min-w-0 flex-1'>
        <p className='text-xs font-medium text-foreground truncate pr-2'>
          {thread.title ?? 'Untitled'}
        </p>
      </div>
      <div className='flex items-center'>
        <span className='text-xs text-muted-foreground whitespace-nowrap'>
          {duration} ago
        </span>
        <RenameThreadButton
          title={thread.title ?? 'Untitled'}
          onRename={handleRename}
        />
        <DeleteThreadButton onDelete={onDelete} />
      </div>
    </div>
  )
}
