import { useCallback } from 'react'
import { EventRequestType } from '../../../../../../shared/protocol'
import { Button } from '../../../../common/ui/Button'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'

export const UpgradeButton = () => {
  const { subscription } = useUser()
  const postMessage = usePostMessage()

  const handleSubscribe = useCallback(() => {
    postMessage(EventRequestType.OPEN_EXTERNAL_URL, {
      url: 'https://app.superflex.ai/pricing'
    })
  }, [postMessage])

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
