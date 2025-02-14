import { useMemo } from 'react'
import {
  CommandEmpty,
  CommandGroup,
  CommandList
} from '../../../../../../common/ui/Command'
import { FileDropdownItem } from './FileDropdownItem'
import type { FilePayload } from '../../../../../../../../shared/protocol'

export const FileCommandList = ({
  files,
  selectedFiles,
  onSelect
}: {
  files: FilePayload[]
  selectedFiles: FilePayload[]
  onSelect: (file: FilePayload) => void
}) => {
  const fileItems = useMemo(
    () =>
      files.map(file => (
        <FileDropdownItem
          key={file.id}
          file={file}
          isSelected={!!selectedFiles.find(f => f.id === file.id)}
          onSelect={() => onSelect(file)}
        />
      )),
    [files, selectedFiles, onSelect]
  )

  return (
    <CommandList>
      <CommandEmpty>No files found.</CommandEmpty>
      <CommandGroup>{fileItems}</CommandGroup>
    </CommandList>
  )
}
