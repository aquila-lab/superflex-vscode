import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  type EventResponseMessage,
  EventResponseType,
  type FilePayload
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { useFiles } from '../providers/FilesProvider'

export const useFileSelector = (open: boolean) => {
  const { selectedFiles, fetchFiles, selectFile } = useFiles()
  const [files, setFiles] = useState<FilePayload[]>([])

  const handleFetchFiles = useCallback(
    ({ payload }: EventResponseMessage<EventResponseType.FETCH_FILES>) => {
      setFiles(payload)
    },
    []
  )

  useConsumeMessage(EventResponseType.FETCH_FILES, handleFetchFiles)

  useEffect(() => {
    if (!open) {
      return
    }

    fetchFiles()
  }, [open, fetchFiles])

  return useMemo(
    () => ({
      files,
      selectedFiles,
      selectFile
    }),
    [files, selectedFiles, selectFile]
  )
}
