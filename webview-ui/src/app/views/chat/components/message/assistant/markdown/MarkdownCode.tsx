import { useMemo } from 'react'
import { type MarkdownCodeProps, cn } from '../../../../../../../common/utils'
import { CollapsibleCodeBlock } from './code/CollapsibleCodeBlock'
import { useNewMessage } from '../../../../../../layers/authenticated/providers/NewMessageProvider'

export const MarkdownCode = ({
  inline,
  className,
  children
}: MarkdownCodeProps) => {
  const { isMessageStreaming } = useNewMessage()

  const match = useMemo(
    () => /language-(\w+)(?::([^#]+))?(?:#(\d+)-(\d+))?/.exec(className ?? ''),
    [className]
  )

  const codeBlock = useMemo(() => {
    if (!match || inline) {
      return null
    }
    const [, extension, filePath, startLine, endLine] = match
    return {
      extension,
      ...(filePath && { filePath: filePath.trim() }),
      ...(startLine && { startLine: Number.parseInt(startLine, 10) }),
      ...(endLine && { endLine: Number.parseInt(endLine, 10) })
    }
  }, [match, inline])

  const isCodeBlockLoading = useMemo(() => {
    if (!isMessageStreaming || !codeBlock) {
      return false
    }

    // Check if the code block is still being streamed
    // If the content doesn't end with a triple backtick, it's still streaming
    const content = String(children)
    const isComplete =
      content.trim().endsWith('```') || content.trim().endsWith('`')

    return !isComplete
  }, [children, isMessageStreaming, codeBlock])

  console.log('isCodeBlockLoading', isCodeBlockLoading)

  if (!codeBlock) {
    return (
      <code className={cn('text-sm text-button-background', className)}>
        {children}
      </code>
    )
  }

  const draft = String(children).replace(/\n$/, '')

  return (
    <CollapsibleCodeBlock
      filePath={codeBlock.filePath}
      draft={draft}
      extension={codeBlock.extension}
      // isLoading={isCodeBlockLoading}
      isLoading={false}
    />
  )
}
