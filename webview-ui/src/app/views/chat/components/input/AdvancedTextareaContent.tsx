import type { MessageContent } from '../../../../../../../shared/model'
import { AddSelectedCodeHandler } from './file/AddSelectedCodeHandler'
import { Attachment } from './attachment/Attachment'
import { CoreTextarea } from './CoreTextarea'
import { useEditMode } from '../../providers/EditModeProvider'
import { FilesProvider } from '../../providers/FilesProvider'
import { SendMessageProvider } from '../../providers/SendMessageProvider'
import { AdvancedTextareaContainer } from './AdvancedTextareaContainer'
import { AdvancedTextareaFooter } from './footer/AdvancedTextareaFooter'
import { AdvancedTextareaHeader } from './AdvancedTextareaHeader'
import { FilePreview } from './file/FilePreview'

export const AdvancedTextareaContent = ({
  content
}: {
  content?: MessageContent
}) => {
  const { isMainTextarea } = useEditMode()

  return (
    <AdvancedTextareaContainer>
      <FilesProvider files={content?.files}>
        <AddSelectedCodeHandler />
        <FilePreview />
        <AdvancedTextareaHeader />
        <SendMessageProvider>
          <CoreTextarea />
          <AdvancedTextareaFooter />
        </SendMessageProvider>
        {!isMainTextarea && <Attachment />}
      </FilesProvider>
    </AdvancedTextareaContainer>
  )
}
