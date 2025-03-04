import type { ReactNode } from 'react'
import { Role } from '../../../../../../../../shared/model'
import { cn } from '../../../../../../common/utils'

export const MessageContainer = ({
  role,
  children,
  className
}: {
  role: Role
  children: ReactNode
  className?: string
}) => {
  const baseStyles = 'rounded-lg px-2.5'
  const roleSpecificStyles = role === Role.User ? 'py-0' : 'py-4'

  return (
    <div className={cn(baseStyles, roleSpecificStyles, className)}>
      {children}
    </div>
  )
}
