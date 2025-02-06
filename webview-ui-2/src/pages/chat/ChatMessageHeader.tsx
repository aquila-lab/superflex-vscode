import { useMemo } from 'react'
import { Role } from '../../../../shared/model'
import { getAvatarConfig } from '../../common/utils'
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar'

export const ChatMessageHeader = ({
  role,
  picture,
  username,
  isDraft = false
}: {
  role: Role
  picture?: string | null
  username?: string
  isDraft?: boolean
}) => {
  const avatarConfig = useMemo(
    () => getAvatarConfig(role, picture, username),
    [role, picture, username]
  )
  const displayName = useMemo(
    () => (role === Role.Assistant ? 'Superflex' : username),
    [role, username]
  )

  return (
    <div className='flex flex-row justify-between items-start'>
      <div className='flex items-center mb-2'>
        <Avatar className='mr-2 size-5'>
          <AvatarImage src={avatarConfig.src} alt={avatarConfig.alt} />
          <AvatarFallback>{avatarConfig.fallback}</AvatarFallback>
        </Avatar>
        <p className='text-sm font-medium text-primary'>{displayName}</p>
      </div>
      {isDraft && <span>draft</span>}
    </div>
  )
}
