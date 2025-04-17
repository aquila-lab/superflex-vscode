import { useMemo } from 'react'
import { Button } from '../../../../../common/ui/Button'
import { useGlobal } from '../../../../layers/global/providers/GlobalProvider'
import { useSettingsHandlers } from '../../providers/SettingsProvider'
import { ActionButtons } from '../base/ActionButtons'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { isFreeTierSubscription } from '../../../../../../../shared/model'

export const UserActions = () => {
  const { isFigmaAuthenticated } = useGlobal()
  const {
    handleConnectFigma,
    handleDisconnectFigma,
    handleSignOut,
    handleSubscribe
  } = useSettingsHandlers()
  const { subscription } = useUser()

  const isFreePlan = useMemo(
    () => isFreeTierSubscription(subscription),
    [subscription]
  )

  return (
    <ActionButtons>
      {isFigmaAuthenticated ? (
        <Button
          variant='outline'
          onClick={handleDisconnectFigma}
        >
          Disconnect Figma
        </Button>
      ) : isFreePlan ? (
        <Button onClick={handleSubscribe}>Upgrade for Figma to Code</Button>
      ) : (
        <Button onClick={handleConnectFigma}>Connect Figma</Button>
      )}
      <Button
        variant='outline'
        onClick={handleSignOut}
      >
        Sign Out
      </Button>
    </ActionButtons>
  )
}
