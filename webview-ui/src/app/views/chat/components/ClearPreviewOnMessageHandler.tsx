import { useEffect } from 'react'
import { useFiles } from '../providers/FilesProvider'
import { useNewMessage } from '../../../layers/authenticated/providers/NewMessageProvider'

export const ClearPreviewOnMessageHandler = ({
  children
}: { children: React.ReactNode }) => {
  const { isMessageProcessing } = useNewMessage()
  const { setPreviewedFile } = useFiles()

  useEffect(() => {
    if (isMessageProcessing) {
      setPreviewedFile(null)
    }
  }, [isMessageProcessing, setPreviewedFile])

  return children
}
