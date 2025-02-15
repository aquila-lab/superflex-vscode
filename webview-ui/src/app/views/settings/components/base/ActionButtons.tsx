import type { ReactNode } from 'react'

export const ActionButtons = ({ children }: { children: ReactNode }) => (
  <div className='flex flex-col gap-6 sm:flex-row sm:justify-between sm:items-center'>
    {children}
  </div>
)
