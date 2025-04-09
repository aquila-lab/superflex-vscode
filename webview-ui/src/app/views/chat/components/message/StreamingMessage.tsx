import { memo, useMemo } from 'react'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { AssistantMessage } from './assistant/AssistantMessage'
import { ThinkingMessage } from './thinking/ThinkingMessage'
import { LoadingDots } from '../../../../../common/ui/LoadingDots'

const StreamingMessageComponent = () => {
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

      // Case 1: Thinking tags not found - could be regular assistant message or not started yet
      if (thinkingStartIndex === -1) {
        return {
          thinkingContent: null,
          assistantContent: message,
          isThinkingComplete: true // No thinking to complete
        }
      }

      // Case 2: Thinking started but not completed (still streaming thinking content)
      if (thinkingEndIndex === -1) {
        const thinkingPartialContent = text.substring(thinkingStartIndex + 10)
        return {
          thinkingContent: thinkingPartialContent,
          assistantContent: null,
          isThinkingComplete: false
        }
      }

      // Case 3: Thinking completed, now extract both parts
      const extractedThinkingContent = text.substring(
        thinkingStartIndex + 10,
        thinkingEndIndex
      )

      // Get everything after the thinking closing tag
      const remainingText = text.substring(thinkingEndIndex + 11)

      // Only create assistant message if there's content after thinking
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
      <ThinkingMessage
        content={enhancedTextDelta}
        type='enhance'
        open={!thinkingContent && !assistantContent}
        isStreaming={!isEnhanceComplete}
      />

      {isEnhanceComplete && !thinkingContent && !assistantContent && (
        <LoadingDots isLoading={true} />
      )}

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
