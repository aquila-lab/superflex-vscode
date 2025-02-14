import { useMemo, type ReactNode } from 'react'
import { ApplyControls } from './apply/ApplyControls'
import { useNewMessage } from '../../../../../../../layers/authenticated/providers/NewMessageProvider'
import { CopyButton } from './apply/CopyButton'
import { CodeBlockName } from './CodeBlockName'

export const CodeBlockToolbar = ({
  filePath,
  isStreamingMessage = false,
  children
}: {
  filePath?: string
  isStreamingMessage?: boolean
  children: ReactNode
}) => {
  const { isMessageStreaming } = useNewMessage()
  const content = String(children)
  const canApplyControls = useMemo(
    () => !isStreamingMessage || !isMessageStreaming,
    [isStreamingMessage, isMessageStreaming]
  )

  if (!filePath) {
    return null
  }

  return (
    <div className='flex items-center justify-between gap-4 px-1 rounded-t-md border-b border-border bg-sidebar h-6'>
      <CodeBlockName filePath={filePath} />
      <div className='flex flex-row items-center'>
        <CopyButton content={content} />
        {canApplyControls && (
          <ApplyControls
            filePath={filePath}
            content={content}
          />
        )}
      </div>
    </div>
  )
}
