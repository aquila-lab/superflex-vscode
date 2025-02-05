import { type MessageContent, Role } from '../../../../shared/model'
import { AttachmentProvider } from '../../context/AttachmentContext'
import { useEditMode } from '../../context/EditModeContext'
import { FilesProvider } from '../../context/FilesProvider'
import { InputProvider } from '../../context/InputContext'
import { useUser } from '../../context/UserContext'
import { ChatAttachment } from './ChatAttachment'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatInputBoxContainer } from './ChatInputBoxContainer'
import { ChatMessageContainer } from './ChatMessageContainer'
import { ChatMessageHeader } from './ChatMessageHeader'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import { FigmaSelectionModal } from './FigmaSelectionModal'
import { FilePreview } from './FilePreview'

export const ChatInputBox = ({ content }: { content?: MessageContent }) => {
  const { isEditMode, isDraft } = useEditMode()
  const { user } = useUser()

  return (
    <AttachmentProvider attachment={content?.attachment}>
      <ChatAttachment />

      <InputProvider text={content?.text}>
        <ChatInputBoxContainer>
          <FilesProvider files={content?.files}>
            <FilePreview />
            <ChatTopToolbar />
            {!isEditMode && (
              <ChatMessageContainer role={Role.User}>
                <ChatMessageHeader
                  role={Role.User}
                  picture={user.picture}
                  username={user.username}
                  isDraft={isDraft}
                />
              </ChatMessageContainer>
            )}
            <ChatTextarea />
            <ChatBottomToolbar />
          </FilesProvider>
        </ChatInputBoxContainer>
      </InputProvider>

      <FigmaSelectionModal />
    </AttachmentProvider>
  )
}
