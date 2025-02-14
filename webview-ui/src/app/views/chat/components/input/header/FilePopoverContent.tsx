import { useMemo } from 'react'
import { Command, CommandInput } from '../../../../../../common/ui/Command'
import { PopoverContent } from '../../../../../../common/ui/Popover'
import { createFileSearchFilter } from '../../../../../../common/utils'
import { KeyboardHints } from './KeyboardHints'
import { FileCommandList } from './FileCommandList'
import type { FilePayload } from '../../../../../../../../shared/protocol'

export const FilePopoverContent = ({
  files,
  selectedFiles,
  onSelect
}: {
  files: FilePayload[]
  selectedFiles: FilePayload[]
  onSelect: (file: FilePayload) => void
}) => {
  const customFilter = useMemo(() => createFileSearchFilter(), [])

  return (
    <PopoverContent className='w-60 h-[300px] p-0'>
      <Command filter={customFilter}>
        <CommandInput
          placeholder='Search files...'
          className='h-6'
        />
        <FileCommandList
          files={files}
          selectedFiles={selectedFiles}
          onSelect={onSelect}
        />
        <KeyboardHints />
      </Command>
    </PopoverContent>
  )
}
