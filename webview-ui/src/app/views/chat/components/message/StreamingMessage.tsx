import { memo, useMemo } from 'react'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'
import { AssistantMessage } from './assistant/AssistantMessage'
import { ThinkingMessage } from './thinking/ThinkingMessage'

const StreamingMessageComponent = () => {
  const {
    message,
    isMessageStreaming,
    isMessageProcessing,
    enhancedTextDelta
  } = useNewMessage()

  const { thinkingContent, assistantContent } = useMemo(() => {
    if (!message?.content?.text) {
      return { thinkingContent: '', assistantContent: null }
    }

    const text = message.content.text
    const thinkingEndIndex = text.indexOf('</Thinking>')

    if (thinkingEndIndex === -1) {
      const thinkingStartIndex = text.indexOf('<Thinking>')
      if (thinkingStartIndex !== -1) {
        return {
          thinkingContent: text.substring(thinkingStartIndex + 10),
          assistantContent: null
        }
      }
      return { thinkingContent: '', assistantContent: message }
    }

    const thinkingStartIndex = text.indexOf('<Thinking>')
    const extractedThinkingContent =
      thinkingStartIndex !== -1
        ? text.substring(thinkingStartIndex + 10, thinkingEndIndex).trim()
        : ''

    const modifiedText = text
      .replace(/<Thinking>[\s\S]*?<\/Thinking>/, '')
      .trim()
    const modifiedMessage = {
      ...message,
      content: { ...message.content, text: modifiedText }
    }

    return {
      thinkingContent: extractedThinkingContent,
      assistantContent: modifiedMessage
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
        open={isMessageProcessing}
        isStreaming={isMessageProcessing && !isMessageStreaming}
      />
      {(isMessageStreaming || thinkingContent) && (
        <ThinkingMessage
          content={thinkingContent}
          type='thinking'
          isStreaming={isMessageStreaming && !assistantContent}
          open={isMessageProcessing || isMessageStreaming}
        />
      )}
      {assistantContent && <AssistantMessage message={assistantContent} />}
    </>
  )
}

export const StreamingMessage = memo(StreamingMessageComponent)
