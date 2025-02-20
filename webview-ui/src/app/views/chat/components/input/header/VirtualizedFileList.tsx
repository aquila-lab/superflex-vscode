import { useMemo } from 'react'
import { List, AutoSizer } from 'react-virtualized'
import type { FilePayload } from '../../../../../../../../shared/protocol'
import { CommandEmpty, CommandList } from '../../../../../../common/ui/Command'
import { FileCommandList } from './FileCommandList'

export const VirtualizedFileList = ({
  files,
  selectedFiles,
  onSelect,
  searchValue
}: {
  files: FilePayload[]
  selectedFiles: FilePayload[]
  onSelect: (file: FilePayload) => void
  searchValue: string
}) => {
  const rowRenderer = useMemo(
    () =>
      ({
        index,
        key,
        style
      }: { index: number; key: string; style: object }) => (
        <div
          key={key}
          style={style}
        >
          <FileCommandList
            files={[files[index]]}
            selectedFiles={selectedFiles}
            onSelect={onSelect}
          />
        </div>
      ),
    [files, selectedFiles, onSelect]
  )

  return (
    <CommandList className='overflow-y-hidden'>
      {files.length === 0 ? (
        <CommandEmpty>No files found.</CommandEmpty>
      ) : (
        <div className='h-[240px]'>
          <AutoSizer>
            {({ height, width }) => (
              <List
                width={width}
                height={height}
                rowCount={files.length}
                rowHeight={28}
                rowRenderer={rowRenderer}
                overscanRowCount={5}
                aria-label='File list'
                tabIndex={0}
                role='listbox'
              />
            )}
          </AutoSizer>
        </div>
      )}
    </CommandList>
  )
}
