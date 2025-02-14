import type { MessageContent } from '../../../../../../../shared/model'
import { AddSelectedCodeHandler } from './AddSelectedCodeHandler'
import { Attachment } from './attachment/Attachment'
import { CoreTextarea } from './core/CoreTextarea'
import { useEditMode } from '../../providers/EditModeProvider'
import { FilesProvider } from '../../providers/FilesProvider'
import { SendMessageProvider } from '../../providers/SendMessageProvider'
import { AdvancedTextareaContainer } from './AdvancedTextareaContainer'
import { AdvancedTextareaFooter } from './footer/AdvancedTextareaFooter'
import { AdvancedTextareaHeader } from './header/AdvancedTextareaHeader'
import { TextareaHandlersProvider } from '../../providers/CoreTextareaProvider'
import { TextareaFooterProvider } from '../../providers/TextareaFooterProvider'

export const AdvancedTextareaContent = ({
  content
}: {
  content?: MessageContent
}) => {
  const { isMainTextarea } = useEditMode()

  return (
    <AdvancedTextareaContainer>
      <FilesProvider files={content?.files}>
        <AddSelectedCodeHandler>
          <AdvancedTextareaHeader />
          <SendMessageProvider>
            <TextareaHandlersProvider>
              <CoreTextarea />
            </TextareaHandlersProvider>
            <TextareaFooterProvider>
              <AdvancedTextareaFooter />
            </TextareaFooterProvider>
          </SendMessageProvider>
          {!isMainTextarea && <Attachment />}
        </AddSelectedCodeHandler>
      </FilesProvider>
    </AdvancedTextareaContainer>
  )
}
