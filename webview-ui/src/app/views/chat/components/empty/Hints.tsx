import { useEffect, useState, useMemo } from 'react'
import { getHints } from '../../../../../common/utils'
import { HintMessage } from './HintMessage'

export const Hints = () => {
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const hints = useMemo(() => getHints(), [])

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentHintIndex(current => (current + 1) % hints.length)
        setIsVisible(true)
      }, 1000)
    }, 4000)

    return () => clearInterval(intervalId)
  }, [hints.length])

  return (
    <div className='relative my-6'>
      <HintMessage
        hint={hints[currentHintIndex]}
        isVisible={isVisible}
      />
    </div>
  )
}
