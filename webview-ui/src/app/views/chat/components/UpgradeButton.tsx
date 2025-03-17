import { useCallback } from 'react'
import { EventRequestType } from '../../../../../../shared/protocol'
import { Button } from '../../../../common/ui/Button'
import { useGlobal } from '../../../layers/global/providers/GlobalProvider'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'
import { useUser } from '../../../layers/authenticated/providers/UserProvider'

export const UpgradeButton = () => {
  const { config } = useGlobal()
  const { subscription } = useUser()
  const postMessage = usePostMessage()

  const handleSubscribe = useCallback(() => {
    postMessage(EventRequestType.OPEN_EXTERNAL_URL, {
      url: `https://app.superflex.ai/dashboard/upgrade-subscription?redirect=true&source=${config?.uriScheme}`
    })
  }, [postMessage, config?.uriScheme])

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
