import { useMemo } from 'react'
import { type MarkdownCodeProps, cn } from '../../../../../../../common/utils'
import { CollapsibleCodeBlock } from './code/CollapsibleCodeBlock'
import { useCodeBlockLoading } from '../../../../providers/CodeBlockLoadingProvider'

export const MarkdownCode = ({
  inline,
  className,
  children
}: MarkdownCodeProps) => {
  const match = useMemo(
    () => /language-(\w+)(?::([^#]+))?(?:#(\d+)-(\d+))?/.exec(className ?? ''),
    [className]
  )

  const { setLoading } = useCodeBlockLoading()

  const codeBlock = useMemo(() => {
    if (!match || inline) {
      return null
    }
    const [, extension, filePath, startLine, endLine] = match

    setLoading(filePath)

    return {
      extension,
      ...(filePath && { filePath: filePath.trim() }),
      ...(startLine && { startLine: Number.parseInt(startLine, 10) }),
      ...(endLine && { endLine: Number.parseInt(endLine, 10) })
    }
  }, [match, inline, setLoading])

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
    />
  )
}
