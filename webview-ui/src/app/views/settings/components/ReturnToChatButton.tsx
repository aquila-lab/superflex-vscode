import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { Button } from '../../../../common/ui/Button'
import { useSettingsHandlers } from '../providers/SettingsProvider'

export const ReturnToChatButton = () => {
  const { handleReturnToChat } = useSettingsHandlers()

  return (
    <div className='flex items-center'>
      <Button
        variant='outline'
        size='sm'
        onClick={handleReturnToChat}
        className='mr-2 w-full'
        aria-label='Back to chat'
      >
        <span className='text-sm text-muted-foreground flex items-center gap-2'>
          <ArrowLeftIcon className='h-4 w-4' />
          Return to Chat
        </span>
      </Button>
    </div>
  )
}
