import { TextareaAutosize } from '../../../../../../common/ui/TextareaAutosize'
import { useTextareaHandlers } from '../../../providers/CoreTextareaProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { useInput } from '../../../providers/InputProvider'

export const TextareaElement = () => {
  const { input, inputRef } = useInput()
  const { isEditMode } = useEditMode()
  const { handleInputChange, handleKeyDown, handlePaste } =
    useTextareaHandlers()

  return (
    <TextareaAutosize
      ref={inputRef}
      autoFocus
      value={input}
      placeholder='Describe your UI component... (⌘+; to focus)'
      className='border-0 shadow-none'
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onPaste={handlePaste}
      disabled={!isEditMode}
    />
  )
}
