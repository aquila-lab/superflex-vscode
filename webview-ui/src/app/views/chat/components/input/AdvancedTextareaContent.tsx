import type { MessageContent } from '../../../../../../../shared/model'
import { TextareaHandlersProvider } from '../../providers/CoreTextareaProvider'
import { useEditMode } from '../../providers/EditModeProvider'
import { FilesProvider } from '../../providers/FilesProvider'
import { SendMessageProvider } from '../../providers/SendMessageProvider'
import { TextareaFooterProvider } from '../../providers/TextareaFooterProvider'
import { AddSelectedCodeHandler } from './AddSelectedCodeHandler'
import { AdvancedTextareaContainer } from './AdvancedTextareaContainer'
import { Attachment } from './attachment/Attachment'
import { CoreTextarea } from './core/CoreTextarea'
import { AdvancedTextareaFooter } from './footer/AdvancedTextareaFooter'
import { AdvancedTextareaHeader } from './header/AdvancedTextareaHeader'

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
