import { type ChangeEvent, useCallback } from 'react'
import { Button } from '../../components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '../../components/ui/Dialog'
import { Input } from '../../components/ui/Input'
import { useAttachment } from '../../context/AttachmentContext'

export const FigmaSelectionModal = () => {
  const {
    isSelectionModalOpen,
    figmaLink,
    setFigmaLink,
    submitSelection,
    closeSelectionModal
  } = useAttachment()

  const handleOpenChange = useCallback(
    () => closeSelectionModal(),
    [closeSelectionModal]
  )

  const handleSubmit = useCallback(() => submitSelection(), [submitSelection])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFigmaLink(e.target.value)
    },
    [setFigmaLink]
  )

  return (
    <Dialog
      open={isSelectionModalOpen}
      onOpenChange={handleOpenChange}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter the link of Figma selection</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col gap-2'>
          <Input
            type='text'
            value={figmaLink}
            placeholder='https://www.figma.com/design/GAo9lY4bI...'
            onChange={handleInputChange}
          />

          <Button
            onClick={handleSubmit}
            className='w-full'
          >
            Submit
          </Button>

          <p className='text-xs text-muted-foreground'>
            {
              'You can copy the link from the Figma selection by right-clicking on the selection and selecting '
            }
            <span className='font-medium'>
              {'"Copy/Paste as" → "Copy link to selection"'}
            </span>
          </p>

          <div className='flex-1 h-full w-full min-h-[11rem] figma-copy-selection-example rounded-md overflow-hidden' />
        </div>
      </DialogContent>
    </Dialog>
  )
}
