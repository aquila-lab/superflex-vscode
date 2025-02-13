import { Cross2Icon } from '@radix-ui/react-icons'
import { type MouseEvent, useCallback } from 'react'
import { useEditMode } from './EditModeProvider'
import type { FilePayload } from '../../../../../../shared/protocol'
import { Button } from '../../../../common/ui/Button'
import { cn } from '../../../../common/utils'
import { useFiles } from './FilesProvider'
import { FileIcon } from '../../../../common/ui/FileIcon'

export const FileTab = ({ file }: { file: FilePayload }) => {
  const { previewedFile, deselectFile, setPreviewedFile } = useFiles()
  const { isEditMode, isMainTextbox } = useEditMode()

  const togglePreviewedFile = useCallback(() => {
    if (previewedFile?.id === file.id) {
      setPreviewedFile(null)
      return
    }

    setPreviewedFile(file)
  }, [file, previewedFile, setPreviewedFile])

  const handleDeselectFile = useCallback(
    (e: MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation()
      deselectFile(file)
    },
    [deselectFile, file]
  )

  return (
    <div className='flex flex-col'>
      <div
        className={cn(
          'flex items-center gap-0.5 bg-background rounded-md pl-0.5 pr-1.5 cursor-pointer',
          previewedFile?.id === file.id
            ? 'border border-accent'
            : 'border border-border'
        )}
        onClick={togglePreviewedFile}
      >
        <div className='flex flex-row items-center gap-0.5'>
          <FileIcon filePath={file.relativePath} className='size-5' />
          <p className='text-xs text-foreground truncate max-w-16'>
            {file.name}
          </p>
          <p className='text-xs text-muted-secondary-foreground'>
            {file.startLine &&
              file.endLine &&
              ` (${file?.startLine}-${file?.endLine})`}
            {file.isCurrentOpenFile && isMainTextbox && '(current)'}
          </p>
        </div>
        {isEditMode && (
          <div className='ml-auto flex gap-2 mt-0.5'>
            <Button
              size='xs'
              variant='text'
              className='p-0'
              onClick={handleDeselectFile}
              aria-label={`remove-${file.name}`}
            >
              <Cross2Icon className='size-3.5' />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
