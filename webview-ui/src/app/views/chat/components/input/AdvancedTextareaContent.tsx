import type { MessageContent } from '../../../../../../../shared/model'
import { TextareaHandlersProvider } from '../../providers/CoreTextareaProvider'
import { FilesProvider } from '../../providers/FilesProvider'
import { SendMessageProvider } from '../../providers/SendMessageProvider'
import { TextareaFooterProvider } from '../../providers/TextareaFooterProvider'
import { AddSelectedCodeHandler } from './AddSelectedCodeHandler'
import { AdvancedTextareaContainer } from './AdvancedTextareaContainer'
import { CoreTextarea } from './core/CoreTextarea'
import { AdvancedTextareaFooter } from './footer/AdvancedTextareaFooter'
import { AdvancedTextareaHeader } from './header/AdvancedTextareaHeader'
import { Attachment } from './attachment/Attachment'

export const AdvancedTextareaContent = ({
  content
}: {
  content?: MessageContent
}) => {
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
            <Attachment />
          </SendMessageProvider>
        </AddSelectedCodeHandler>
      </FilesProvider>
    </AdvancedTextareaContainer>
  )
}
