import { memo, useMemo } from 'react'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { AssistantMessage } from './assistant/AssistantMessage'
import { ThinkingMessage } from './thinking/ThinkingMessage'
import { DotLoader } from '../../../../../common/ui/DotLoader'

const StreamingMessageComponent = ({
  isFollowUp = false
}: {
  isFollowUp?: boolean
}) => {
  const {
    message,
    isMessageStreaming,
    isMessageProcessing,
    isEnhanceComplete,
    enhancedTextDelta
  } = useNewMessage()

  const { thinkingContent, assistantContent, isThinkingComplete } =
    useMemo(() => {
      if (!message?.content?.text) {
        return {
          thinkingContent: null,
          assistantContent: null,
          isThinkingComplete: false
        }
      }

      const text = message.content.text
      const thinkingStartIndex = text.indexOf('<Thinking>')
      const thinkingEndIndex = text.indexOf('</Thinking>')

      if (thinkingStartIndex === -1) {
        return {
          thinkingContent: null,
          assistantContent: message,
          isThinkingComplete: true
        }
      }

      if (thinkingEndIndex === -1) {
        const thinkingPartialContent = text.substring(thinkingStartIndex + 10)
        return {
          thinkingContent: thinkingPartialContent,
          assistantContent: null,
          isThinkingComplete: false
        }
      }

      const extractedThinkingContent = text.substring(
        thinkingStartIndex + 10,
        thinkingEndIndex
      )

      const remainingText = text.substring(thinkingEndIndex + 11)

      const modifiedMessage = remainingText
        ? {
            ...message,
            content: { ...message.content, text: remainingText }
          }
        : null

      return {
        thinkingContent: extractedThinkingContent,
        assistantContent: modifiedMessage,
        isThinkingComplete: true
      }
    }, [message])

  if (!isMessageProcessing && !isMessageStreaming) {
    return null
  }

  return (
    <>
      {!isFollowUp && (
        <ThinkingMessage
          content={enhancedTextDelta}
          type='enhance'
          open={!thinkingContent && !assistantContent}
          isStreaming={!isEnhanceComplete}
        />
      )}

      {(isFollowUp || isEnhanceComplete) &&
        !thinkingContent &&
        !assistantContent && <DotLoader />}

      {thinkingContent && (
        <ThinkingMessage
          content={thinkingContent}
          type='thinking'
          open={!assistantContent}
          isStreaming={!isThinkingComplete}
        />
      )}

      {assistantContent && <AssistantMessage message={assistantContent} />}
    </>
  )
}

export const StreamingMessage = memo(StreamingMessageComponent)
