import { useCallback } from 'react'
import { Button } from '../../../../common/ui/Button'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'

export const OutOfRequests = () => {
  const { subscribe } = useUser()

  const handleSubscribe = useCallback(() => subscribe(), [subscribe])

  return (
    <div className='flex flex-col items-center justify-center gap-4 text-center p-4 h-full '>
      <p className='text-2xl font-bold'>Out of Free Requests</p>
      <p>
        You have used all your free requests for this month. Subscribe now to
        continue using the service without interruptions.
      </p>
      <Button onClick={handleSubscribe}>Subscribe Now</Button>
    </div>
  )
}
