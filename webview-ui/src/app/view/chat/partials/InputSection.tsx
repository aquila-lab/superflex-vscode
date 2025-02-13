import { AddSelectedCode } from './AddSelectedCode'
import { ChatAttachment } from './ChatAttachment'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatInputBoxWrapperContainer } from './ChatInputBoxContainer'
import { FilePreview } from './FilePreview'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import type { MessageContent } from '../../../../../../shared/model'
import { useEditMode } from './EditModeProvider'
import { FilesProvider } from './FilesProvider'
import { SendMessageProvider } from './SendMessageProvider'

export const InputSection = ({
  content
}: {
  content?: MessageContent
}) => {
  const { isMainTextbox } = useEditMode()

  return (
    <ChatInputBoxWrapperContainer>
      <FilesProvider files={content?.files}>
        <AddSelectedCode />
        <FilePreview />
        <ChatTopToolbar />
        <SendMessageProvider>
          <ChatTextarea />
          <ChatBottomToolbar />
        </SendMessageProvider>
        {!isMainTextbox && <ChatAttachment />}
      </FilesProvider>
    </ChatInputBoxWrapperContainer>
  )
}
