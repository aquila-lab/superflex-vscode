import { Button } from '../../../../../common/ui/Button'
import { useGlobal } from '../../../../layers/global/providers/GlobalProvider'
import { useSettingsHandlers } from '../../providers/SettingsProvider'
import { ActionButtons } from '../base/ActionButtons'

export const UserActions = () => {
  const { isFigmaAuthenticated } = useGlobal()
  const { handleConnectFigma, handleDisconnectFigma, handleSignOut } =
    useSettingsHandlers()

  return (
    <ActionButtons>
      {isFigmaAuthenticated ? (
        <Button
          variant='outline'
          onClick={handleDisconnectFigma}
        >
          Disconnect Figma
        </Button>
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
