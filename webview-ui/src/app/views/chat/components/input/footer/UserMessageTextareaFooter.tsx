import { useTextareaFooter } from '../../../providers/TextareaFooterProvider'
import { EnhanceSwitch } from '../EnhanceSwitch'
import { ResendButton } from './ResendButton'
import { AddAttachmentButtons } from './AddAttachmentButtons'

export const UserMessageTextareaFooter = () => {
  const { hasContent, isFigmaLoading, handleSend } = useTextareaFooter()

  return (
    <div className='flex flex-row justify-between items-center gap-4 py-0.5 pl-0.5 pr-2 border-t border-border'>
      <AddAttachmentButtons />

      <div className='flex flex-row items-center gap-1'>
        <EnhanceSwitch />
        <ResendButton
          hasContent={hasContent}
          isFigmaLoading={isFigmaLoading}
          onResend={handleSend}
        />
      </div>
    </div>
  )
}
