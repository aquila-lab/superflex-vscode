import { Cross1Icon } from '@radix-ui/react-icons'
import { Button } from '../../../../../common/ui/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '../../../../../common/ui/Tooltip'
import { useCallback, type MouseEvent } from 'react'

export const DeleteThreadButton = ({
  onDelete
}: {
  onDelete: () => void
}) => {
  const handleDelete = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      onDelete()
    },
    [onDelete]
  )

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant='text'
          size='icon'
          onClick={handleDelete}
          className='opacity-0 group-hover:opacity-100 hover:text-destructive h-auto transition-[opacity,width] duration-200 group-hover:w-auto w-0 overflow-hidden'
          aria-label='Delete thread'
        >
          <Cross1Icon className='size-3' />
        </Button>
      </TooltipTrigger>
      <TooltipContent portal>
        <p className='text-xs m-0 text-muted-foreground'>Delete thread</p>
      </TooltipContent>
    </Tooltip>
  )
}
