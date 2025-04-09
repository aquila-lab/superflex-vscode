import { useCallback, useMemo } from 'react'
import { EventRequestType } from '../../../../../../../../../../shared/protocol'
import { FileIcon } from '../../../../../../../../common/ui/FileIcon'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../../../../../../../common/ui/Tooltip'
import { getFileName } from '../../../../../../../../common/utils'
import { usePostMessage } from '../../../../../../../layers/global/hooks/usePostMessage'
import { cn } from '../../../../../../../../common/utils'
import { Loader2 } from 'lucide-react'

export const CodeBlockName = ({
  filePath,
  isLoading = false
}: {
  filePath: string
  isLoading?: boolean
}) => {
  const postMessage = usePostMessage()

  const handleFileNameClick = useCallback(
    () => postMessage(EventRequestType.OPEN_FILE, { filePath }),
    [postMessage, filePath]
  )

  const shimmerClass = useMemo(() => {
    if (!isLoading) {
      return ''
    }

    return 'relative after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent after:animate-shimmer'
  }, [isLoading])

  return (
    <div className='flex items-center gap-1 min-w-0'>
      {isLoading ? (
        <Loader2 className='size-4 text-muted-foreground animate-spin' />
      ) : (
        <FileIcon
          filePath={filePath}
          className='size-4'
        />
      )}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              onClick={handleFileNameClick}
              className={cn(
                'text-[11px] text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0 cursor-pointer',
                shimmerClass
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
