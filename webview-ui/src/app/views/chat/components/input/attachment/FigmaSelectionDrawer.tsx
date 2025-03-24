import { type ChangeEvent, useCallback, useState } from 'react'
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
import { Alert, AlertDescription } from '../../../../../../common/ui/Alert'
import { Check, RefreshCw } from 'lucide-react'

export const FigmaSelectionDrawer = () => {
  const { focusInput } = useInput()
  const {
    isSelectionDrawerOpen,
    figmaLink,
    setFigmaLink,
    submitSelection,
    closeSelectionDrawer,
    submitButtonRef,
    inputRef,
    isFigmaLoading,
    figmaAttachment,
    confirmSelection,
    figmaError
  } = useAttachment()

  const [isConfirmStep, setIsConfirmStep] = useState(false)

  const handleOpenChange = useCallback(() => {
    if (!isFigmaLoading) {
      closeSelectionDrawer()
      setIsConfirmStep(false)
    }
  }, [closeSelectionDrawer, isFigmaLoading])

  const handleSubmit = useCallback(() => {
    if (isConfirmStep) {
      confirmSelection()
      setIsConfirmStep(false)
      queueMicrotask(focusInput)
    } else {
      submitSelection()
      setIsConfirmStep(true)
    }
  }, [submitSelection, isConfirmStep, confirmSelection, focusInput])

  const handleCancel = useCallback(() => {
    setIsConfirmStep(false)
    closeSelectionDrawer()
  }, [closeSelectionDrawer])

  const handleRetry = useCallback(() => {
    setIsConfirmStep(false)
    submitSelection()
  }, [submitSelection])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFigmaLink(e.target.value)
    },
    [setFigmaLink]
  )

  const renderContent = useCallback(() => {
    if (isConfirmStep && figmaAttachment) {
      return (
        <div className='flex flex-col px-4 gap-4'>
          {figmaAttachment.imageUrl && (
            <div className='w-full rounded-md overflow-hidden'>
              <img
                src={figmaAttachment.imageUrl}
                alt='Figma Selection'
                className='w-full object-contain'
              />
            </div>
          )}

          <p className='text-sm text-muted-foreground'>
            Confirm this Figma selection to add it to your message.
          </p>
        </div>
      )
    }

    if (figmaError) {
      return (
        <div className='flex flex-col px-4 gap-4'>
          <Input
            type='text'
            value={figmaLink}
            placeholder='https://www.figma.com/design/GAo9lY4bI...'
            onChange={handleInputChange}
            className='w-full'
            ref={inputRef}
          />

          <div className='flex-1 h-full w-full min-h-[11rem] figma-copy-selection-example rounded-md overflow-hidden' />

          <p className='text-xs text-muted-foreground'>
            To copy the link, right-click on your Figma selection and select{' '}
            <span className='font-medium'>
              "Copy/Paste as" → "Copy link to selection"
            </span>
          </p>
        </div>
      )
    }

    return (
      <div className='flex flex-col px-4 gap-4'>
        <Input
          type='text'
          value={figmaLink}
          placeholder='https://www.figma.com/design/GAo9lY4bI...'
          onChange={handleInputChange}
          className='w-full'
          ref={inputRef}
        />

        <div className='flex-1 h-full w-full min-h-[11rem] figma-copy-selection-example rounded-md overflow-hidden' />

        <p className='text-xs text-muted-foreground'>
          To copy the link, right-click on your Figma selection and select{' '}
          <span className='font-medium'>
            "Copy/Paste as" → "Copy link to selection"
          </span>
        </p>
      </div>
    )
  }, [
    figmaAttachment,
    figmaError,
    figmaLink,
    inputRef,
    isConfirmStep,
    handleInputChange
  ])

  const renderFooterButtons = useCallback(() => {
    if (isConfirmStep && figmaAttachment) {
      return (
        <div className='flex px-4 w-full mb-8'>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='flex-1'
            disabled={isFigmaLoading}
          >
            Cancel
          </Button>
          <Button
            ref={submitButtonRef}
            onClick={handleSubmit}
            className='flex-1'
            disabled={isFigmaLoading}
            isLoading={isFigmaLoading}
          >
            {!isFigmaLoading && (
              <>
                <Check className='mr-2 h-4 w-4' /> Confirm Selection
              </>
            )}
          </Button>
        </div>
      )
    }

    if (figmaError) {
      return (
        <div className='flex w-full mb-8 gap-3'>
          <Button
            variant='outline'
            onClick={handleCancel}
            className='flex-1'
          >
            Cancel
          </Button>
          <Button
            ref={submitButtonRef}
            onClick={handleRetry}
            className='flex-1'
            disabled={!figmaLink.length || isFigmaLoading}
            isLoading={isFigmaLoading}
          >
            {!isFigmaLoading && (
              <>
                <RefreshCw className='h-4 w-4' /> Retry
              </>
            )}
          </Button>
        </div>
      )
    }

    return (
      <Button
        ref={submitButtonRef}
        onClick={handleSubmit}
        className='w-full mb-8'
        disabled={!figmaLink.length || isFigmaLoading}
        isLoading={isFigmaLoading}
      >
        Add Selection
      </Button>
    )
  }, [
    figmaAttachment,
    figmaError,
    figmaLink,
    handleCancel,
    handleRetry,
    handleSubmit,
    isConfirmStep,
    isFigmaLoading,
    submitButtonRef
  ])

  return (
    <Drawer
      open={isSelectionDrawerOpen}
      onOpenChange={handleOpenChange}
    >
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            {isConfirmStep ? 'Confirm Figma Selection' : 'Add Figma Selection'}
          </DrawerTitle>
          {figmaError ? (
            <Alert
              variant='destructive'
              className='mt-2'
            >
              <AlertDescription>{figmaError}</AlertDescription>
            </Alert>
          ) : isConfirmStep && figmaAttachment?.warning ? (
            <Alert
              variant='warning'
              className='mt-2'
            >
              <AlertDescription>
                {figmaAttachment.warning.message}
              </AlertDescription>
            </Alert>
          ) : (
            <DrawerDescription>
              {isConfirmStep
                ? 'Review your Figma selection below'
                : 'Paste the link to your Figma selection below'}
            </DrawerDescription>
          )}
        </DrawerHeader>

        {renderContent()}

        <DrawerFooter>{renderFooterButtons()}</DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
