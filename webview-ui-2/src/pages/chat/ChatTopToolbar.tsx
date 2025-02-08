import { useEditMode } from '../../context/EditModeContext'
import { FileSelectorPopover } from './FileSelectorPopover'
import { SelectedFiles } from './SelectedFiles'

export const ChatTopToolbar = () => {
  const { isEditMode } = useEditMode()

  return (
    <div className='flex flex-wrap gap-0.5 p-2 pb-0'>
      {isEditMode && (
        <div className='mr-1'>
          <FileSelectorPopover />
        </div>
      )}
      <SelectedFiles />
    </div>
  )
}
