import { CodeEditor } from '../../../../../../../../common/ui/CodeEditor'
import { CodeBlockToolbar } from './CodeBlockToolbar'

export const CodeBlock = ({
  filePath,
  draft,
  extension
}: {
  filePath?: string
  draft: string
  extension: string
}) => {
  return (
    <div className='rounded-md border border-border bg-background mt-1'>
      <CodeBlockToolbar filePath={filePath}>{draft}</CodeBlockToolbar>
      <CodeEditor
        extension={extension}
        filePath={filePath}
      >
        {draft}
      </CodeEditor>
    </div>
  )
}
