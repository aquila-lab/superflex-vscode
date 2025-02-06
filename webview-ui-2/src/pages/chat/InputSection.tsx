import type { MessageContent } from '../../../../shared/model'
import { FilesProvider } from '../../context/FilesProvider'
import { ChatAttachment } from './ChatAttachment'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatInputBoxContainer } from './ChatInputBoxContainer'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import { FilePreview } from './FilePreview'

export const InputSection = ({
  content,
  isMainChat = false
}: {
  content?: MessageContent
  isMainChat?: boolean
}) => (
  <ChatInputBoxContainer>
    <FilesProvider files={content?.files}>
      <FilePreview />
      <ChatTopToolbar />
      <ChatTextarea />
      <ChatBottomToolbar />
      {!isMainChat && <ChatAttachment />}
    </FilesProvider>
  </ChatInputBoxContainer>
)
