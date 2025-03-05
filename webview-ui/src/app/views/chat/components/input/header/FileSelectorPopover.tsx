import { useState } from 'react'
import { Popover } from '../../../../../../common/ui/Popover'
import { useFileSelector } from '../../../hooks/useFileSelector'
import { useEditMode } from '../../../providers/EditModeProvider'
import { FilePopoverContent } from './FilePopoverContent'
import { FileSelectTrigger } from './FileSelectTrigger'

export const FileSelectorPopover = () => {
  const { isEditMode } = useEditMode()
  const [open, setOpen] = useState(false)
  const { files, selectedFiles, selectFile } = useFileSelector(open)

  if (!isEditMode) {
    return null
  }

  return (
    <div className='mr-0.5'>
      <Popover
        open={open}
        onOpenChange={setOpen}
      >
        <FileSelectTrigger open={open} />
        <FilePopoverContent
          files={files}
          selectedFiles={selectedFiles}
          onSelect={selectFile}
        />
      </Popover>
    </div>
  )
}
