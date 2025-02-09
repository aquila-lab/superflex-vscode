import type { MessageContent } from '../../../../shared/model'
import { useEditMode } from '../../context/EditModeContext'
import { FilesProvider } from '../../context/FilesProvider'
import { ChatAttachment } from './ChatAttachment'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatInputBoxContainer } from './ChatInputBoxContainer'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import { FilePreview } from './FilePreview'

export const InputSection = ({
  content
}: {
  content?: MessageContent
}) => {
  const { isMainTextbox } = useEditMode()

  return (
    <ChatInputBoxContainer>
      <FilesProvider files={content?.files}>
        <FilePreview />
        <ChatTopToolbar />
        <ChatTextarea />
        <ChatBottomToolbar />
        {!isMainTextbox && <ChatAttachment />}
      </FilesProvider>
    </ChatInputBoxContainer>
  )
}
