import { InfoField } from '../base/InfoField'
import { useUser } from '../../../../layers/authenticated/providers/UserProvider'

export const UserInfo = () => {
  const { user } = useUser()

  return (
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
  )
}
