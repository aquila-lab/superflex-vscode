import { useMemo } from 'react'
import { useFiles } from '../../context/FilesProvider'
import { FileTab } from './FileTab'
import { useEditMode } from '../../context/EditModeContext'

export const SelectedFiles = () => {
  const { selectedFiles } = useFiles()
  const { isEditMode } = useEditMode()

  const renderSelectedFiles = useMemo(
    () => selectedFiles.map(file => <FileTab key={file.id} file={file} />),
    [selectedFiles]
  )

  if (!selectedFiles.length) {
    if (!isEditMode) {
      return (
        <p className='text-xs text-muted-foreground self-center'>
          No files provided
        </p>
      )
    }

    return (
      <p className='text-xs text-muted-foreground self-center'>Add context</p>
    )
  }

  return renderSelectedFiles
}
