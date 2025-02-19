import { Pencil1Icon } from '@radix-ui/react-icons'
import { Button } from '../../../../../common/ui/Button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '../../../../../common/ui/Tooltip'
import { useCallback, useState, type MouseEvent } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../../../../common/ui/Dialog'
import { Input } from '../../../../../common/ui/Input'

export const RenameThreadButton = ({
  title,
  onRename
}: {
  title: string
  onRename: (newTitle: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(title)

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsOpen(true)
  }, [])

  const handleRename = useCallback(() => {
    if (newTitle.trim() && newTitle !== title) {
      onRename(newTitle.trim())
    }
    setIsOpen(false)
  }, [newTitle, title, onRename])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleRename()
      }
    },
    [handleRename]
  )

  return (
    <>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant='text'
            size='icon'
            onClick={handleClick}
            className='opacity-0 group-hover:opacity-100 hover:text-accent h-auto transition-[opacity,width] duration-200 group-hover:w-auto w-0 overflow-hidden'
            aria-label='Rename thread'
          >
            <Pencil1Icon className='size-3' />
          </Button>
        </TooltipTrigger>
        <TooltipContent portal>
          <p className='text-xs m-0 text-muted-foreground'>Rename thread</p>
        </TooltipContent>
      </Tooltip>

      <Dialog
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename Thread</DialogTitle>
          </DialogHeader>
          <Input
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Enter new title'
            autoFocus
          />
          <div className='flex justify-end gap-2 mt-4'>
            <Button
              variant='outline'
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleRename}>Rename</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
