import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { CodeBlockName } from './CodeBlockName'
import { ApplyControls } from './apply/ApplyControls'
import { CopyButton } from './apply/CopyButton'
import { ShiningText } from '../../../../../../../../common/ui/ShiningText'
import { useCodeBlockLoading } from '../../../../../providers/CodeBlockLoadingProvider'
import { Spinner } from '../../../../../../../../common/ui/Spinner'
import { getFileName } from '../../../../../../../../common/utils'

export const CodeBlockToolbar = ({
  filePath,
  children
}: {
  filePath?: string
  children: ReactNode
}) => {
  const content = String(children)
  const { isLoading } = useCodeBlockLoading()

  if (!filePath) {
    return null
  }

  const isLoadingState = useMemo(
    () => isLoading(filePath),
    [filePath, isLoading]
  )

  const fileName = useMemo(() => {
    return getFileName(filePath)
  }, [filePath])

  return (
    <div className='flex items-center justify-between gap-4 px-1 rounded-t-md border-b border-border bg-sidebar h-6'>
      {isLoadingState ? (
        <div className='flex items-center justify-center gap-1.5 pl-2'>
          <Spinner size='xs' />
          <ShiningText>{fileName}</ShiningText>
        </div>
      ) : (
        <CodeBlockName filePath={filePath} />
      )}
      {!isLoadingState && (
        <div className='flex flex-row items-center'>
          <CopyButton content={content} />
          <ApplyControls
            filePath={filePath}
            content={content}
          />
        </div>
      )}
    </div>
  )
}
