import { SettingsCard } from '../base/SettingsCard'
import { UserInfo } from './UserInfo'
import { UserActions } from './UserActions'

export const UserInfoCard = () => (
  <SettingsCard title='User Information'>
    <UserInfo />
    <UserActions />
  </SettingsCard>
)
