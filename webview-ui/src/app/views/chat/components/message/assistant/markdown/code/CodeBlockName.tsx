import { useCallback } from 'react'
import { EventRequestType } from '../../../../../../../../../../shared/protocol'
import { FileIcon } from '../../../../../../../../common/ui/FileIcon'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../../../../../../../common/ui/Tooltip'
import { getFileName } from '../../../../../../../../common/utils'
import { cn } from '../../../../../../../../common/utils'
import { usePostMessage } from '../../../../../../../layers/global/hooks/usePostMessage'

export const CodeBlockName = ({
  filePath
}: {
  filePath: string
}) => {
  const postMessage = usePostMessage()

  const handleFileNameClick = useCallback(
    () => postMessage(EventRequestType.OPEN_FILE, { filePath }),
    [postMessage, filePath]
  )

  return (
    <div className='flex items-center gap-1 min-w-0'>
      <FileIcon
        filePath={filePath}
        className='size-4'
      />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              onClick={handleFileNameClick}
              className={cn(
                'text-[11px] text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0 cursor-pointer'
              )}
            >
              {getFileName(filePath)}
            </p>
          </TooltipTrigger>
          <TooltipContent portal>
            <p className='text-xs m-0 text-muted-foreground'>{filePath}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
