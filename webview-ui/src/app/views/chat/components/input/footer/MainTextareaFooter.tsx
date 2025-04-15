import { TrashIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../../common/ui/Button'
import { useTextareaFooter } from '../../../providers/TextareaFooterProvider'
import { AddAttachmentButtons } from './AddAttachmentButtons'
import { SendButton } from './SendButton'
import { DotLoader } from '../../../../../../common/ui/DotLoader'

export const MainTextareaFooter = () => {
  const { isDisabled, hasContent, handleStop, handleSend } = useTextareaFooter()

  return (
    <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2 border-t border-border'>
      {!isDisabled && <AddAttachmentButtons />}
      {isDisabled && <DotLoader prefix='Generating' />}

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
