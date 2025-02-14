import type { MessageContent } from '../../../../../../shared/model'
import { AddSelectedCode } from './input/AddSelectedCode'
import { ChatAttachment } from './input/ChatAttachment'
import { ChatBottomToolbar } from './input/ChatBottomToolbar'
import { ChatTextarea } from './input/ChatTextarea'
import { ChatTopToolbar } from './input/ChatTopToolbar'
import { useEditMode } from '../providers/EditModeProvider'
import { FilesProvider } from '../providers/FilesProvider'
import { SendMessageProvider } from '../providers/SendMessageProvider'
import { FilePreview } from './file/FilePreview'
import { ChatInputBoxWrapperContainer } from './input/ChatInputBoxContainer'

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
