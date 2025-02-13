import { useCallback } from 'react'
import {
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../shared/protocol'

import { useConsumeMessage } from '../../../layer/global/hooks/useConsumeMessage'
import { useEditMode } from './EditModeProvider'
import { useFiles } from './FilesProvider'

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
