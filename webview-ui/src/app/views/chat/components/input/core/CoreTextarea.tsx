import { useEditMode } from '../../../providers/EditModeProvider'
import { useInput } from '../../../providers/InputProvider'
import { TextareaElement } from './TextareaElement'

export const CoreTextarea = () => {
  const { input } = useInput()
  const { isEditMode } = useEditMode()

  if (!isEditMode && !input.length) {
    return null
  }

  return <TextareaElement />
}
