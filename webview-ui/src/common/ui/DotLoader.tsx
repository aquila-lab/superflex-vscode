import { useEffect, useState, useCallback, useMemo } from 'react'
import { ShiningText } from './ShiningText'
import { ZapIcon } from 'lucide-react'

export const DotLoader = ({
  prefix = 'Generating',
  className = 'text-sm px-2.5 py-2 text-muted-foreground flex items-center justify-start gap-1.5'
}: {
  prefix?: string
  className?: string
}) => {
  const [dotCount, setDotCount] = useState(0)

  const updateDots = useCallback(() => {
    setDotCount(prev => (prev + 1) % 4)
  }, [])

  const loadingText = useMemo(() => {
    return `${prefix}${'.'.repeat(dotCount === 0 ? 3 : dotCount)}`
  }, [dotCount, prefix])

  useEffect(() => {
    const interval = setInterval(updateDots, 200)
    return () => clearInterval(interval)
  }, [updateDots])

  return (
    <div className={className}>
      <ZapIcon className='size-3.5' />
      <ShiningText>{loadingText}</ShiningText>
    </div>
  )
}
