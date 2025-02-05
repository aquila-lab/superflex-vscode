import { useMemo } from 'react'
import { useFiles } from '../../context/FilesProvider'
import { FileTab } from './FileTab'

export const SelectedFiles = () => {
  const { selectedFiles } = useFiles()

  const renderSelectedFiles = useMemo(
    () =>
      selectedFiles.map(file => (
        <FileTab
          key={file.id}
          file={file}
        />
      )),
    [selectedFiles]
  )

  if (!selectedFiles.length) {
    return (
      <p className='text-xs text-muted-foreground self-center'>Add context</p>
    )
  }

  return renderSelectedFiles
}
