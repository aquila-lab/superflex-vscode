import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { useFiles } from '../providers/FilesProvider'

export const useCodePreview = () => {
  const { previewedFile: file, fetchFileContent } = useFiles()
  const [content, setContent] = useState<string | null>(file?.content ?? null)

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

  return useMemo(
    () => ({
      file,
      content
    }),
    [file, content]
  )
}
