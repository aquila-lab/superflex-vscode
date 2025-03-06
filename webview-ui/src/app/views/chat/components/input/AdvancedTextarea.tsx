import type { MessageContent } from '../../../../../../../shared/model'
import { AttachmentProvider } from '../../providers/AttachmentProvider'
import { AdvancedTextareaContent } from './AdvancedTextareaContent'
import { AdvancedTextareaPresenter } from './AdvancedTextareaPresenter'
import { TextareaOverlayHandler } from './TextareaOverlayHandler'
import { AdvancedTextareaDnd } from './dnd/AdvancedTextareaDnd'

export const AdvancedTextarea = ({
  content,
  messageId
}: {
  content?: MessageContent
  messageId?: string
}) => (
  <TextareaOverlayHandler messageId={messageId}>
    <AttachmentProvider attachment={content?.attachment}>
      <AdvancedTextareaDnd>
        <AdvancedTextareaPresenter
          text={content?.text}
          messageId={messageId}
        >
          <AdvancedTextareaContent content={content} />
        </AdvancedTextareaPresenter>
      </AdvancedTextareaDnd>
    </AttachmentProvider>
  </TextareaOverlayHandler>
)
