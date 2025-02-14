import { useTextareaFooter } from '../../../providers/TextareaFooterProvider'
import { AddAttachmentButtons } from './AddAttachmentButtons'
import { ResendButton } from './ResendButton'

export const UserMessageTextareaFooter = () => {
  const { hasContent, isFigmaLoading, handleSend } = useTextareaFooter()

  return (
    <div className='flex flex-row justify-between items-center gap-4 pt-0.5 pb-1 pl-0.5 pr-2'>
      <AddAttachmentButtons />

      <div className='flex flex-row items-center gap-1'>
        <ResendButton
          hasContent={hasContent}
          isFigmaLoading={isFigmaLoading}
          onResend={handleSend}
        />
      </div>
    </div>
  )
}
