import { useEffect, useState, useCallback, useMemo } from 'react'
import { ShiningText } from './ShiningText'

export const DotLoader = ({
  prefix,
  className = 'text-xs px-2.5 py-2 text-muted-foreground'
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
      <ShiningText>{loadingText}</ShiningText>
    </div>
  )
}
