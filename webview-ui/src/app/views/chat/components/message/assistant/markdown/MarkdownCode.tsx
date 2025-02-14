import { useMemo } from 'react'
import { type MarkdownCodeProps, cn } from '../../../../../../../common/utils'
import { CodeBlock } from './code/CodeBlock'

export const MarkdownCode = ({
  inline,
  className,
  children,
  isStreamingMessage = false
}: MarkdownCodeProps) => {
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

  if (!codeBlock) {
    return (
      <code className={cn('text-sm text-button-background', className)}>
        {children}
      </code>
    )
  }

  const draft = String(children).replace(/\n$/, '')

  return (
    <CodeBlock
      filePath={codeBlock.filePath}
      isStreamingMessage={isStreamingMessage}
      draft={draft}
      extension={codeBlock.extension}
    />
  )
}
