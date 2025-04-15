import type { ReactNode } from 'react'

export const ShiningText = ({ children }: { children: ReactNode }) => {
  return (
    <span
      className='inline-block bg-clip-text text-transparent bg-gradient-to-r from-muted-foreground via-foreground to-muted-foreground bg-[length:200%_100%] animate-shine'
      style={{
        WebkitBackgroundClip: 'text'
      }}
    >
      {children}
    </span>
  )
}
