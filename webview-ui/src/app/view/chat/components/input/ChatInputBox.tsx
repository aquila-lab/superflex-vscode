import type { MessageContent } from '../../../../../../../shared/model'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { InputProvider } from '../../providers/InputProvider'
import { InputSection } from '../InputSection'
import { UserMessageHeader } from '../message/UserMessageHeader'
import { ChatAttachment } from './ChatAttachment'
import { FigmaSelectionModal } from './FigmaSelectionModal'

export const ChatInputBox = ({
  content,
  messageId
}: {
  content?: MessageContent
  messageId?: string
}) => {
  const { isMainTextbox, isDraft } = useEditMode()
  const { user } = useUser()

  if (isMainTextbox) {
    return (
      <>
        <ChatAttachment />
        <InputProvider text={content?.text}>
          <InputSection content={content} />
          <FigmaSelectionModal />
        </InputProvider>
      </>
    )
  }

  return (
    <InputProvider
      text={content?.text}
      id={messageId}
    >
      <UserMessageHeader
        picture={user.picture}
        username={user.username}
        isDraft={isDraft}
      />
      <InputSection content={content} />
      <FigmaSelectionModal />
    </InputProvider>
  )
}
