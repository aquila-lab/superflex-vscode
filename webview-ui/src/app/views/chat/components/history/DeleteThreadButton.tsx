import { Cross1Icon } from '@radix-ui/react-icons'
import { type MouseEvent, useCallback } from 'react'
import { Button } from '../../../../../common/ui/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../../../../common/ui/Tooltip'

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='text'
            size='icon'
            onClick={handleDelete}
            className='flex justify-end hover:text-destructive duration-0 group-hover:duration-100'
            aria-label='Delete thread'
          >
            <Cross1Icon className='size-3' />
          </Button>
        </TooltipTrigger>
        <TooltipContent portal>
          <p className='text-xs m-0 text-muted-foreground'>Delete thread</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
