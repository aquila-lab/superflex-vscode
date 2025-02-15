import { Button } from '../../../../../common/ui/Button'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'
import { useGlobal } from '../../../../layers/global/providers/GlobalProvider'
import { useSettingsHandlers } from '../../providers/SettingsProvider'
import { ActionButtons } from '../base/ActionButtons'
import { InfoField } from '../base/InfoField'
import { SettingsCard } from '../base/SettingsCard'

export const UserInfoCard = () => {
  const { isFigmaAuthenticated } = useGlobal()
  const { user } = useUser()
  const { handleConnectFigma, handleDisconnectFigma, handleSignOut } =
    useSettingsHandlers()

  return (
    <SettingsCard title='User Information'>
      <div className='flex flex-col gap-2 sm:flex-row sm:gap-16'>
        <InfoField
          label='Username'
          value={user.username}
        />
        <div className='min-w-0 flex-1'>
          <InfoField
            label='Email'
            value={user.email}
          />
        </div>
      </div>

      <ActionButtons>
        {isFigmaAuthenticated ? (
          <Button
            variant='destructive'
            onClick={handleDisconnectFigma}
          >
            Disconnect Figma
          </Button>
        ) : (
          <Button onClick={handleConnectFigma}>Connect Figma</Button>
        )}
        <Button
          variant='destructive'
          onClick={handleSignOut}
        >
          Sign Out
        </Button>
      </ActionButtons>
    </SettingsCard>
  )
}
