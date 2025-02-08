import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent
} from '@radix-ui/react-tooltip'
import { getFileName } from '../../common/utils'
import { FileIcon } from '../../components/ui/FileIcon'
import { usePostMessage } from '../../hooks/usePostMessage'
import { EventRequestType } from '../../../../shared/protocol'
import { useCallback } from 'react'

export const FileInfo = ({ filePath }: { filePath: string }) => {
  const postMessage = usePostMessage()

  const handleFileNameClick = useCallback(
    () => postMessage(EventRequestType.OPEN_FILE, { filePath }),
    [postMessage, filePath]
  )

  return (
    <div className='flex items-center gap-1 min-w-0'>
      <FileIcon filePath={filePath} className='size-4' />
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              onClick={handleFileNameClick}
              className='text-[11px] text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0 cursor-pointer'
            >
              {getFileName(filePath)}
            </p>
          </TooltipTrigger>
          <TooltipContent>
            <p className='text-xs m-0 text-muted-foreground'>{filePath}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
