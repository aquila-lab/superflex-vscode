import { type ChangeEvent, useCallback } from 'react'
import { Button } from '../../../../../../common/ui/Button'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter
} from '../../../../../../common/ui/Drawer'
import { Input } from '../../../../../../common/ui/Input'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useInput } from '../../../providers/InputProvider'

export const FigmaSelectionDrawer = () => {
  const { focusInput } = useInput()
  const {
    isSelectionDrawerOpen,
    figmaLink,
    setFigmaLink,
    submitSelection,
    closeSelectionDrawer,
    submitButtonRef
  } = useAttachment()

  const handleOpenChange = useCallback(
    () => closeSelectionDrawer(),
    [closeSelectionDrawer]
  )

  const handleSubmit = useCallback(() => {
    submitSelection()
    queueMicrotask(focusInput)
  }, [submitSelection, focusInput])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFigmaLink(e.target.value)
    },
    [setFigmaLink]
  )

  return (
    <Drawer
      open={isSelectionDrawerOpen}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add Figma Selection</DrawerTitle>
          <DrawerDescription>
            Paste the link to your Figma selection below
          </DrawerDescription>
        </DrawerHeader>

        <div className='flex flex-col gap-4 p-4'>
          <Input
            type='text'
            value={figmaLink}
            placeholder='https://www.figma.com/design/GAo9lY4bI...'
            onChange={handleInputChange}
            className='w-full'
          />

          <div className='flex-1 h-full w-full min-h-[11rem] figma-copy-selection-example rounded-md overflow-hidden' />

          <p className='text-xs text-muted-foreground'>
            To copy the link, right-click on your Figma selection and select{' '}
            <span className='font-medium'>
              "Copy/Paste as" → "Copy link to selection"
            </span>
          </p>
        </div>

        <DrawerFooter>
          <Button
            ref={submitButtonRef}
            onClick={handleSubmit}
            className='w-full mb-8'
            disabled={!figmaLink.length}
          >
            Add Selection
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
