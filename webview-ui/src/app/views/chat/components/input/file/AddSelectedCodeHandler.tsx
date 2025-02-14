import { useCallback } from 'react'
import {
  type EventResponseMessage,
  EventResponseType
} from '../../../../../../../../shared/protocol'

import { useConsumeMessage } from '../../../../../layers/global/hooks/useConsumeMessage'
import { useEditMode } from '../../../providers/EditModeProvider'
import { useFiles } from '../../../providers/FilesProvider'

export const AddSelectedCodeHandler = () => {
  const { isMainTextarea } = useEditMode()
  const { selectFile, setPreviewedFile } = useFiles()

  const handleAddSelectedCode = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.ADD_SELECTED_CODE>) => {
      if (isMainTextarea) {
        selectFile(payload)
        setPreviewedFile(payload)
      }
    },
    [isMainTextarea, selectFile, setPreviewedFile]
  )

  useConsumeMessage(EventResponseType.ADD_SELECTED_CODE, handleAddSelectedCode)

  return null
}
