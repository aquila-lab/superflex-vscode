import { Pencil1Icon } from '@radix-ui/react-icons'
import { type MouseEvent, useCallback, useMemo, useState } from 'react'
import { Button } from '../../../../../common/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../../../../common/ui/Dialog'
import { Input } from '../../../../../common/ui/Input'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../../../../common/ui/Tooltip'

export const RenameThreadButton = ({
  title,
  onRename
}: {
  title: string
  onRename: (newTitle: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [newTitle, setNewTitle] = useState(title)

  const submitDisabled = useMemo(() => {
    return newTitle.trim() === title || newTitle.trim() === ''
  }, [newTitle, title])

  const handleClick = useCallback((e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation()
    setIsOpen(true)
  }, [])

  const handleRename = useCallback(
    (e?: MouseEvent) => {
      e?.stopPropagation()
      if (newTitle.trim() && newTitle !== title) {
        onRename(newTitle.trim())
      }
      setIsOpen(false)
    },
    [newTitle, title, onRename]
  )

  const handleCancel = useCallback(() => {
    setIsOpen(false)
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      e.stopPropagation()
      if (e.key === 'Enter') {
        handleRename()
      }
    },
    [handleRename]
  )

  const handleDialogClick = useCallback((e: MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='text'
              size='icon'
              onClick={handleClick}
              className='flex justify-end hover:text-foreground duration-0 group-hover:duration-100'
              aria-label='Rename thread'
            >
              <Pencil1Icon className='size-3' />
            </Button>
          </TooltipTrigger>
          <TooltipContent portal>
            <p className='text-xs m-0 text-muted-foreground'>Rename thread</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Dialog
        open={isOpen}
        onOpenChange={handleCancel}
      >
        <DialogContent onClick={handleDialogClick}>
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
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={submitDisabled}
            >
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
