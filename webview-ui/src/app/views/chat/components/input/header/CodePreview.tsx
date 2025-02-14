import { useCodePreview } from '../../../hooks/useCodePreview'
import { CodePreviewContent } from './CodePreviewContent'

export const CodePreview = () => {
  const { file, content } = useCodePreview()

  if (!file || (!file.content && !content)) {
    return null
  }

  return (
    <CodePreviewContent
      filePath={file.relativePath}
      content={file.content ?? content ?? ''}
    />
  )
}
