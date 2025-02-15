import { useState } from 'react'
import { Popover } from '../../../../../../common/ui/Popover'
import { useEditMode } from '../../../providers/EditModeProvider'
import { FileSelectTrigger } from './FileSelectTrigger'
import { FilePopoverContent } from './FilePopoverContent'
import { useFileSelector } from '../../../hooks/useFileSelector'

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
