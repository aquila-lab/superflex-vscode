import { useCallback } from 'react'
import { Button } from '../../components/ui/Button'
import { useUser } from '../../context/UserContext'

export const UpgradeButton = () => {
  const { subscription } = useUser()

  const handleSubscribe = useCallback(() => {}, [])

  if (!subscription.plan?.name.toLowerCase().includes('free')) {
    return null
  }

  return (
    <Button
      size='xxs'
      className='absolute top-1 right-1.5'
      onClick={handleSubscribe}
    >
      Upgrade
    </Button>
  )
}
