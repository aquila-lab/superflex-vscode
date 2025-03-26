import { Check, RefreshCw } from 'lucide-react'
import { type ChangeEvent, useCallback, useState } from 'react'
import { Alert, AlertDescription } from '../../../../../../common/ui/Alert'
import { Button } from '../../../../../../common/ui/Button'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle
} from '../../../../../../common/ui/Drawer'
import { Input } from '../../../../../../common/ui/Input'
import { Skeleton } from '../../../../../../common/ui/Skeleton'
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
    submitButtonRef,
    inputRef,
    isFigmaLoading,
    confirmSelection,
    figmaError,
    setFigmaPlaceholderAttachment,
    figmaPlaceholderAttachment
  } = useAttachment()

  const [isConfirmStep, setIsConfirmStep] = useState(false)
  const [isImageLoaded, setIsImageLoaded] = useState(false)

  const handleOpenChange = useCallback(() => {
    if (!isFigmaLoading) {
      closeSelectionDrawer()
      setIsConfirmStep(false)
      setIsImageLoaded(false)
      setFigmaPlaceholderAttachment(null)
    }
  }, [closeSelectionDrawer, isFigmaLoading, setFigmaPlaceholderAttachment])

  const handleSubmit = useCallback(() => {
    if (isConfirmStep) {
      confirmSelection()
      setIsConfirmStep(false)
      setIsImageLoaded(false)
      queueMicrotask(focusInput)
    } else {
      submitSelection()
      setIsConfirmStep(true)
    }
  }, [submitSelection, isConfirmStep, confirmSelection, focusInput])

  const handleCancel = useCallback(() => {
    setIsConfirmStep(false)
    setIsImageLoaded(false)
    setFigmaPlaceholderAttachment(null)
    closeSelectionDrawer()
  }, [closeSelectionDrawer, setFigmaPlaceholderAttachment])

  const handleRetry = useCallback(() => {
    setIsConfirmStep(false)
    setIsImageLoaded(false)
    submitSelection()
  }, [submitSelection])

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      setFigmaLink(e.target.value)
    },
    [setFigmaLink]
  )

  const handleImageLoad = useCallback(() => {
    setIsImageLoaded(true)
  }, [])

  const renderContent = useCallback(() => {
    if (isConfirmStep && figmaPlaceholderAttachment) {
      return (
        <div className='flex flex-col px-4 gap-4'>
          {figmaPlaceholderAttachment.imageUrl && (
            <div className='w-full rounded-md overflow-hidden'>
              {!isImageLoaded && <Skeleton className='w-full h-64' />}
              <img
                src={figmaPlaceholderAttachment.imageUrl}
                alt='Figma Selection'
                className={`w-full object-contain max-h-64 ${!isImageLoaded ? 'hidden' : ''}`}
                onLoad={handleImageLoad}
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
    figmaPlaceholderAttachment,
    figmaError,
    figmaLink,
    inputRef,
    isConfirmStep,
    handleInputChange,
    isImageLoaded,
    handleImageLoad
  ])

  const renderFooterButtons = useCallback(() => {
    if (isConfirmStep && figmaPlaceholderAttachment) {
      return (
        <div className='flex gap-3 justify-between w-full mb-4'>
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
                <Check className='h-4 w-4' /> Confirm Selection
              </>
            )}
          </Button>
        </div>
      )
    }

    if (figmaError) {
      return (
        <div className='flex gap-3 justify-between w-full mb-4'>
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
      <div className='w-full mb-4'>
        <Button
          ref={submitButtonRef}
          onClick={handleSubmit}
          className='w-full'
          disabled={!figmaLink.length || isFigmaLoading}
          isLoading={isFigmaLoading}
        >
          Add Selection
        </Button>
      </div>
    )
  }, [
    figmaPlaceholderAttachment,
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
        <DrawerHeader className='pb-4'>
          <DrawerTitle>
            {isConfirmStep && !isFigmaLoading
              ? 'Confirm Figma Selection'
              : 'Add Figma Selection'}
          </DrawerTitle>
          {figmaError ? (
            <Alert
              variant='destructive'
              className='mt-4'
            >
              <AlertDescription>{figmaError}</AlertDescription>
            </Alert>
          ) : isConfirmStep && figmaPlaceholderAttachment?.warning ? (
            <Alert
              variant='warning'
              className='mt-4'
            >
              <AlertDescription>
                {figmaPlaceholderAttachment.warning.message}
              </AlertDescription>
            </Alert>
          ) : (
            <DrawerDescription>
              {isConfirmStep && !isFigmaLoading
                ? 'Review your Figma selection below'
                : 'Paste the link to your Figma selection below'}
            </DrawerDescription>
          )}
        </DrawerHeader>

        {renderContent()}

        <DrawerFooter className='px-4 pt-4 pb-8'>
          {renderFooterButtons()}
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
