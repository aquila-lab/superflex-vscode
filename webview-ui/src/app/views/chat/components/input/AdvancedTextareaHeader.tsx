import { useEditMode } from '../../providers/EditModeProvider'
import { FileSelectorPopover } from './file/FileSelectorPopover'
import { SelectedFiles } from './file/SelectedFiles'

export const AdvancedTextareaHeader = () => {
  const { isEditMode } = useEditMode()

  return (
    <div className='flex flex-wrap gap-0.5 p-2 pb-0'>
      {isEditMode && <FileSelectorPopover />}
      <SelectedFiles />
    </div>
  )
}
