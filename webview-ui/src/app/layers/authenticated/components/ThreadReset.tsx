import { Fragment, type ReactNode } from 'react'
import { useThreads } from '../providers/ThreadsProvider'

export const ThreadReset = ({ children }: { children: ReactNode }) => {
  const { threadKey } = useThreads()

  return <Fragment key={threadKey}>{children}</Fragment>
}
