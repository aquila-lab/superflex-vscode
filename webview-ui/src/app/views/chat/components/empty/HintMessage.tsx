import { useEffect, useState } from 'react'
import { cn } from '../../../../../common/utils'

export const HintMessage = ({
  hint,
  isVisible
}: {
  hint: {
    text: string
    shortcut: string
  }
  isVisible: boolean
}) => {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setShouldRender(true)
    } else {
      const timer = setTimeout(() => setShouldRender(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [isVisible])

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={cn(
        'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
        'flex items-center text-sm text-muted-foreground transition-opacity duration-1000',
        'bg-muted bg-opacity-30 border border-muted rounded-lg px-2 py-1.5',
        'whitespace-nowrap max-w-[90%]',
        isVisible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <span className='font-medium mr-2'>Hint:</span>
      <span className='truncate'>{hint.text}</span>
      <kbd className='ml-2 shrink-0 px-2 py-0.5 text-xs bg-muted rounded-md'>
        {hint.shortcut}
      </kbd>
    </div>
  )
}
