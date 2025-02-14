import { TrashIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../../../common/ui/Button'
import { useTextareaFooter } from '../../../providers/TextareaFooterProvider'
import { AddAttachmentButtons } from './AddAttachmentButtons'
import { SendButton } from './SendButton'

export const MainTextareaFooter = () => {
  const { isDisabled, hasContent, handleStop, handleSend } = useTextareaFooter()

  return (
    <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2'>
      <AddAttachmentButtons />

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
            className='text-[11px] px-1 py-0 hover:bg-muted'
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
