import { useMemo } from 'react'
import { useEditMode } from '../../../providers/EditModeProvider'
import { useFiles } from '../../../providers/FilesProvider'
import { FileTab } from './FileTab'

export const SelectedFiles = () => {
  const { isEditMode } = useEditMode()
  const { selectedFiles, superflexRules } = useFiles()

  const renderSelectedFiles = useMemo(() => {
    return (
      <>
        {superflexRules && (
          <FileTab
            key={superflexRules.id}
            file={superflexRules}
          />
        )}
        {selectedFiles.map(file => (
          <FileTab
            key={file.id}
            file={file}
          />
        ))}
      </>
    )
  }, [selectedFiles, superflexRules])

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
