import { TrashIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../../common/ui/Button'
import { useTextareaFooter } from '../../../providers/TextareaFooterProvider'
import { AddAttachmentButtons } from './AddAttachmentButtons'
import { SendButton } from './SendButton'
import { useEffect, useState, useCallback, useMemo } from 'react'

export const MainTextareaFooter = () => {
  const { isDisabled, hasContent, handleStop, handleSend } = useTextareaFooter()
  const [dotCount, setDotCount] = useState(0)

  const updateDots = useCallback(() => {
    setDotCount(prev => (prev + 1) % 4)
  }, [])

  const generatingText = useMemo(() => {
    return `Generating${'.'.repeat(dotCount === 0 ? 3 : dotCount)}`
  }, [dotCount])

  useEffect(() => {
    if (!isDisabled) {
      return
    }

    const interval = setInterval(updateDots, 200)
    return () => clearInterval(interval)
  }, [isDisabled, updateDots])

  return (
    <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2 border-t border-border'>
      {!isDisabled && <AddAttachmentButtons />}
      {isDisabled && (
        <div className='text-xs px-2.5 py-2 text-muted-foreground'>
          {generatingText}
        </div>
      )}

      <div className='flex flex-row items-center gap-1'>
        {!isDisabled && (
          <SendButton
            hasContent={hasContent}
            isDisabled={isDisabled}
            onSend={handleSend}
          />
        )}
        {isDisabled && (
          <Button
            size='xs'
            variant='text'
            className='text-xs px-1 py-0 hover:bg-muted'
            onClick={handleStop}
          >
            <TrashIcon className='size-3.5' />
            stop
          </Button>
        )}
      </div>
    </div>
  )
}
