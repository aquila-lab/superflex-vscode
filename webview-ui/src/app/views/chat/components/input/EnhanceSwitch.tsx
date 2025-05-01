import { useMemo } from 'react'
import { TbBrain } from 'react-icons/tb'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '../../../../../common/ui/Tooltip'
import { Button } from '../../../../../common/ui/Button'
import { cn } from '../../../../../common/utils'
import { useEnhancePrompt } from '../../../../layers/authenticated/providers/EnhancePromptProvider'
import { useNewMessage } from '../../../../layers/authenticated/providers/NewMessageProvider'

export const EnhanceSwitch = () => {
  const { isEnhancePromptEnabled, toggleEnhancePrompt } = useEnhancePrompt()
  const { isMessageProcessing, isMessageStreaming } = useNewMessage()

  const tooltipText = useMemo(
    () =>
      isEnhancePromptEnabled
        ? 'AI prompt enhancement enabled'
        : 'AI prompt enhancement disabled',
    [isEnhancePromptEnabled]
  )

  return (
    <div className='flex justify-end'>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type='button'
              size='xs'
              variant='text'
              onClick={toggleEnhancePrompt}
              disabled={isMessageProcessing || isMessageStreaming}
              className={cn(
                'gap-0.5 transition-opacity duration-150',
                'active:scale-110 active:opacity-80 transition-transform',
                isEnhancePromptEnabled
                  ? 'bg-primary/20 text-primary hover:bg-primary/40 active:bg-primary/50'
                  : 'bg-transparent text-muted-foreground hover:bg-muted/20 hover:text-muted-foreground active:bg-muted/30'
              )}
              aria-checked={isEnhancePromptEnabled}
              role='switch'
            >
              <TbBrain
                className='size-3.5'
                aria-hidden='true'
              />
              <span className='hidden xs:block text-xs'>Enhance</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tooltipText}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
