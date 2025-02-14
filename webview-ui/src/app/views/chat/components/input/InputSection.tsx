import type { MessageContent } from '../../../../../../../shared/model'
import { AddSelectedCode } from './AddSelectedCode'
import { ChatAttachment } from './ChatAttachment'
import { ChatBottomToolbar } from './ChatBottomToolbar'
import { ChatTextarea } from './ChatTextarea'
import { ChatTopToolbar } from './ChatTopToolbar'
import { useEditMode } from '../../providers/EditModeProvider'
import { FilesProvider } from '../../providers/FilesProvider'
import { SendMessageProvider } from '../../providers/SendMessageProvider'
import { FilePreview } from '../file/FilePreview'
import { ChatInputBoxWrapperContainer } from './ChatInputBoxContainer'

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
