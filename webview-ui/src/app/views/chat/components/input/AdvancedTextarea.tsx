import { AdvancedTextareaDnd } from './dnd/AdvancedTextareaDnd'
import type { MessageContent } from '../../../../../../../shared/model'
import { AttachmentProvider } from '../../providers/AttachmentProvider'
import { AdvancedTextareaPresenter } from './AdvancedTextareaPresenter'
import { AdvancedTextareaContent } from './AdvancedTextareaContent'
import { TextareaOverlayHandler } from './TextareaOverlayHandler'

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
