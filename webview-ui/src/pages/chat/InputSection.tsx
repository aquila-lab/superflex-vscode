import type { MessageContent } from '../../../../shared/model'
import { useEditMode } from '../../context/EditModeContext'
import { FilesProvider } from '../../context/FilesProvider'
import { AddSelectedCode } from './AddSelectedCode'
import { ChatAttachment } from './ChatAttachment'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatInputBoxWrapperContainer } from './ChatInputBoxContainer'
import { FilePreview } from './FilePreview'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import { SendMessageProvider } from '../../context/SendMessageContext'

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
