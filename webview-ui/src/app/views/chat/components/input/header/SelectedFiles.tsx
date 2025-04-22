import { useMemo } from 'react'
import { useAttachment } from '../../../providers/AttachmentProvider'
import { useEditMode } from '../../../providers/EditModeProvider'
import { useFiles } from '../../../providers/FilesProvider'
import { AttachmentTab } from './AttachmentTab'
import { FileTab } from './FileTab'

export const SelectedFiles = () => {
  const { selectedFiles } = useFiles()
  const { imageAttachment, figmaAttachment } = useAttachment()
  const { isEditMode } = useEditMode()

  const hasAttachment = useMemo(
    () => Boolean(imageAttachment || figmaAttachment),
    [imageAttachment, figmaAttachment]
  )

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

  if (!selectedFiles.length && !hasAttachment) {
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

  return (
    <>
      {renderSelectedFiles}
      {hasAttachment && <AttachmentTab />}
    </>
  )
}
