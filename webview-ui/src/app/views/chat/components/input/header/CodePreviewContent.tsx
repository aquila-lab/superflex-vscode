import { memo } from 'react'
import { CodeEditor } from '../../../../../../common/ui/CodeEditor'

export const CodePreviewContent = memo(
  ({
    filePath,
    content
  }: {
    filePath: string
    content: string
  }) => (
    <div className='rounded-md -mb-1 mt-1.5 mx-1.5 bg-background border border-accent'>
      <div className='max-h-60 overflow-hidden'>
        <CodeEditor
          filePath={filePath}
          maxHeight={200}
        >
          {content}
        </CodeEditor>
      </div>
    </div>
  )
)
