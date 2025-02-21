import type { FilePayload } from '../../../../../../../../shared/protocol'
import { CommandItem } from '../../../../../../common/ui/Command'
import { FileIcon } from '../../../../../../common/ui/FileIcon'
import { useMemo } from 'react'
import { getFileSearchKeywords } from '../../../../../../common/utils'

export const FileDropdownItem = ({
  file,
  isSelected,
  onSelect
}: {
  file: FilePayload
  isSelected: boolean
  onSelect: () => void
}) => {
  const keywords = useMemo(
    () => getFileSearchKeywords(file.relativePath),
    [file.relativePath]
  )

  return (
    <CommandItem
      key={file.id}
      value={file.relativePath}
      keywords={keywords}
      added={isSelected}
      onSelect={onSelect}
    >
      <div className='flex items-center gap-2 w-full'>
        <FileIcon
          filePath={file.relativePath}
          className='size-5'
        />
        <span className='text-sm whitespace-nowrap'>{file.name}</span>
        <span className='text-left text-xs text-muted-foreground truncate flex-1'>
          {file.relativePath}
        </span>
      </div>
    </CommandItem>
  )
}
