import { Fragment, useMemo } from 'react'
import type { FilePayload } from '../../../../../../../../shared/protocol'
import { CommandGroup } from '../../../../../../common/ui/Command'
import { FileDropdownItem } from './FileDropdownItem'

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
    <Fragment>
      <CommandGroup className='overflow-y-hidden'>{fileItems}</CommandGroup>
    </Fragment>
  )
}
