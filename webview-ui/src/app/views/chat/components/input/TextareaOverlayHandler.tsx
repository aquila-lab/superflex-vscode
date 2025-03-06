import { useEffect } from 'react'
import { useOverlay } from '../../../../layers/authenticated/providers/OverlayProvider'
import { useEditMode } from '../../providers/EditModeProvider'

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
