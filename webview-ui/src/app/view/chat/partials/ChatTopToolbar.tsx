import { useEditMode } from './EditModeProvider'
import { FileSelectorPopover } from './FileSelectorPopover'
import { SelectedFiles } from './SelectedFiles'

export const ChatTopToolbar = () => {
  const { isEditMode } = useEditMode()

  return (
    <div className='flex flex-wrap gap-0.5 p-2 pb-0'>
      {isEditMode && <FileSelectorPopover />}
      <SelectedFiles />
    </div>
  )
}
