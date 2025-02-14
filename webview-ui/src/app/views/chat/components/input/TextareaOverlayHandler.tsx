import { useEffect } from 'react'
import { useEditMode } from '../../providers/EditModeProvider'
import { useOverlay } from '../../../../layers/authenticated/providers/OverlayProvider'

export const TextareaOverlayHandler = ({
  messageId,
  children
}: {
  messageId?: string
  children: React.ReactNode
}) => {
  const { isEditMode } = useEditMode()
  const { setActiveMessageId } = useOverlay()

  useEffect(() => {
    if (isEditMode) {
      setActiveMessageId(messageId ?? null)
    } else {
      setActiveMessageId(null)
    }
  }, [isEditMode, messageId, setActiveMessageId])

  return children
}
