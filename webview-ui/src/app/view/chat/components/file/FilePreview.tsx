import { useCallback, useEffect, useState } from 'react'
import {
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../../layers/global/hooks/useConsumeMessage'
import { useFiles } from '../../providers/FilesProvider'
import { Editor } from '../markdown/Editor'

export const FilePreview = () => {
  const { previewedFile: file, fetchFileContent } = useFiles()
  const [content, setContent] = useState(file?.content ?? null)

  const handleFetchFileContent = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.FETCH_FILE_CONTENT>) => {
      if (payload) {
        setContent(payload)
      }
    },
    []
  )

  useConsumeMessage(
    EventResponseType.FETCH_FILE_CONTENT,
    handleFetchFileContent
  )

  useEffect(() => {
    if (file && !file?.content) {
      fetchFileContent(file)
    }
  }, [file, fetchFileContent])

  if (!file || (!file.content && !content)) {
    return null
  }

  return (
    <div className='rounded-md -mb-1 mt-1.5 mx-1.5 bg-background border border-accent'>
      <div className='max-h-60 overflow-hidden'>
        <Editor
          filePath={file.relativePath}
          maxHeight={200}
        >
          {file.content ?? content}
        </Editor>
      </div>
    </div>
  )
}
