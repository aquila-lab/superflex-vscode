import { cn } from '../../../../../common/utils'

export const MessageWrapper = ({
  children,
  className
}: {
  children: React.ReactNode
  className?: string
}) => <div className={cn('mb-2', className)}>{children}</div>
