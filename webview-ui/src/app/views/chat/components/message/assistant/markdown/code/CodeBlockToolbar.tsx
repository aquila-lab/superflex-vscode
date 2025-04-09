import type { ReactNode } from 'react'
import { CodeBlockName } from './CodeBlockName'
import { ApplyControls } from './apply/ApplyControls'
import { CopyButton } from './apply/CopyButton'

export const CodeBlockToolbar = ({
  filePath,
  children,
  isLoading = false
}: {
  filePath?: string
  children: ReactNode
  isLoading?: boolean
}) => {
  const content = String(children)

  if (!filePath) {
    return null
  }

  return (
    <div className='flex items-center justify-between gap-4 px-1 rounded-t-md border-b border-border bg-sidebar h-6'>
      <CodeBlockName
        filePath={filePath}
        isLoading={isLoading}
      />
      <div className='flex flex-row items-center'>
        <CopyButton content={content} />
        <ApplyControls
          filePath={filePath}
          content={content}
        />
      </div>
    </div>
  )
}
