import type { MessageContent } from '../../../../shared/model'
import { FilesProvider } from '../../context/FilesProvider'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatInputBoxContainer } from './ChatInputBoxContainer'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import { FilePreview } from './FilePreview'

export const InputSection = ({ content }: { content?: MessageContent }) => (
  <ChatInputBoxContainer>
    <FilesProvider files={content?.files}>
      <FilePreview />
      <ChatTopToolbar />
      <ChatTextarea />
      <ChatBottomToolbar />
    </FilesProvider>
  </ChatInputBoxContainer>
)
