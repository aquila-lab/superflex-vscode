import { useState } from 'react'
import type { FilePayload } from '../../../../../../../../shared/protocol'
import { Command, CommandInput } from '../../../../../../common/ui/Command'
import { PopoverContent } from '../../../../../../common/ui/Popover'
import { KeyboardHints } from './KeyboardHints'
import { VirtualizedFileList } from './VirtualizedFileList'

export const FilePopoverContent = ({
  files,
  selectedFiles,
  onSelect
}: {
  files: FilePayload[]
  selectedFiles: FilePayload[]
  onSelect: (file: FilePayload) => void
}) => {
  const [searchValue, setSearchValue] = useState('')

  return (
    <PopoverContent className='w-60 h-[300px] p-0'>
      <Command>
        <CommandInput
          placeholder='Search files...'
          className='h-6'
          value={searchValue}
          onValueChange={setSearchValue}
        />
        <VirtualizedFileList
          files={files}
          selectedFiles={selectedFiles}
          onSelect={onSelect}
          searchValue={searchValue}
        />
        <KeyboardHints />
      </Command>
    </PopoverContent>
  )
}
