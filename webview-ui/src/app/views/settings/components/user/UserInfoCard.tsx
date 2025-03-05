import { SettingsCard } from '../base/SettingsCard'
import { UserActions } from './UserActions'
import { UserInfo } from './UserInfo'

export const UserInfoCard = () => (
  <SettingsCard title='User Information'>
    <UserInfo />
    <UserActions />
  </SettingsCard>
)
