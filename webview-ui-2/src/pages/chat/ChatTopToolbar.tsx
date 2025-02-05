import { FileSelectorPopover } from './FileSelectorPopover'
import { SelectedFiles } from './SelectedFiles'

export const ChatTopToolbar = () => {
  return (
    <div className='flex flex-wrap gap-2 p-2 pb-0.5'>
      <FileSelectorPopover />
      <SelectedFiles />
    </div>
  )
}
