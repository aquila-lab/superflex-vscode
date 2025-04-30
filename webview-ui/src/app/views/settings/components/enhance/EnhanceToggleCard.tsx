import { useEnhancePrompt } from '../../../../layers/authenticated/providers/EnhancePromptProvider'
import { useMemo } from 'react'
import { SettingsCard } from '../base/SettingsCard'
import { Button } from '../../../../../common/ui/Button'

export const EnhanceToggleCard = () => {
  const { isEnhancePromptEnabled, toggleEnhancePrompt } = useEnhancePrompt()

  const handleToggle = useMemo(() => toggleEnhancePrompt, [toggleEnhancePrompt])

  return (
    <SettingsCard title='Prompt Enhancement'>
      <div className='space-y-2'>
        <p className='text-sm'>
          Enable or disable AI prompt enhancement for more detailed responses
        </p>
        <div className='flex items-center justify-between'>
          <div className='space-y-0.5'>
            <p className='text-sm font-medium'>Enhance Prompts</p>
            <p className='text-xs text-muted-foreground'>
              {isEnhancePromptEnabled
                ? 'Prompt enhancement is enabled'
                : 'Prompt enhancement is disabled'}
            </p>
          </div>
          <Button
            variant={isEnhancePromptEnabled ? 'default' : 'outline'}
            onClick={handleToggle}
          >
            {isEnhancePromptEnabled ? 'Disable' : 'Enable'}
          </Button>
        </div>
      </div>
    </SettingsCard>
  )
}
