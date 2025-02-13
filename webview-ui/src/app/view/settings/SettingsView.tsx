import { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeftIcon } from '@radix-ui/react-icons'
import { BillingCard } from './partials/BillingCard'
import { UserInfoCard } from './partials/UserInfoCard'
import { Button } from '../../../common/ui/Button'
import { useUser } from '../../layer/authenticated/UserProvider'

export const SettingsView = () => {
  const navigate = useNavigate()
  const { fetchSubscription } = useUser()

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const handleReturnToChat = useCallback(() => {
    navigate('/chat')
  }, [navigate])

  return (
    <div className='flex-1 w-full p-6 space-y-8'>
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
      <UserInfoCard />
      <BillingCard />
    </div>
  )
}
