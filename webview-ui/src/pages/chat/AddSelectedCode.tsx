import { useCallback } from 'react'
import {
  type EventResponseMessage,
  EventResponseType
} from '../../../../shared/protocol'
import { useConsumeMessage } from '../../hooks/useConsumeMessage'
import { useEditMode } from '../../context/EditModeContext'
import { useFiles } from '../../context/FilesProvider'

export const AddSelectedCode = () => {
  const { isMainTextbox } = useEditMode()
  const { selectFile, setPreviewedFile } = useFiles()

  const handleAddSelectedCode = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.ADD_SELECTED_CODE>) => {
      if (isMainTextbox) {
        selectFile(payload)
        setPreviewedFile(payload)
      }
    },
    [isMainTextbox, selectFile, setPreviewedFile]
  )

  useConsumeMessage(EventResponseType.ADD_SELECTED_CODE, handleAddSelectedCode)

  return null
}
