import { useMemo } from 'react'
import type { FilePayload } from '../../../../../../../../shared/protocol'
import { FileCommandList } from './FileCommandList'
import { List, AutoSizer } from 'react-virtualized'
import { CommandList } from '../../../../../../common/ui/Command'

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
  const filteredFiles = useMemo(() => {
    if (!searchValue) {
      return files
    }

    return files.filter(file =>
      file.relativePath.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [files, searchValue])

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
            files={[filteredFiles[index]]}
            selectedFiles={selectedFiles}
            onSelect={onSelect}
          />
        </div>
      ),
    [filteredFiles, selectedFiles, onSelect]
  )

  return (
    <CommandList className='overflow-y-hidden'>
      <div className='h-[240px]'>
        <AutoSizer>
          {({ height, width }) => (
            <List
              width={width}
              height={height}
              rowCount={filteredFiles.length}
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
    </CommandList>
  )
}
