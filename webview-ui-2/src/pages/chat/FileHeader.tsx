import type { ReactNode } from 'react'
import { useNewMessage } from '../../context/NewMessageContext'
import { ApplyControls } from './ApplyControls'
import { CopyButton } from './CopyButton'
import { FileInfo } from './FileInfo'

export const FileHeader = ({
  filePath,
  isStreamingMessage = false,
  children
}: {
  filePath: string
  isStreamingMessage?: boolean
  children: ReactNode
}) => {
  const { isMessageStreaming } = useNewMessage()
  const content = String(children)

  return (
    <div className='flex items-center justify-between gap-4 px-1 rounded-t-md border-b border-border bg-sidebar h-6'>
      <FileInfo filePath={filePath} />
      <div className='flex flex-row items-center'>
        <CopyButton content={content} />
        {(!isStreamingMessage || !isMessageStreaming) && (
          <ApplyControls filePath={filePath} content={content} />
        )}
      </div>
    </div>
  )
}
