import { useEffect, useState } from 'react'
import { HintMessage } from './HintMessage'
import { HINTS } from '../../../../common/utils'

export const Hints = () => {
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false)

      setTimeout(() => {
        setCurrentHintIndex(current => (current + 1) % HINTS.length)
        setIsVisible(true)
      }, 1000)
    }, 4000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className='relative my-6'>
      <HintMessage hint={HINTS[currentHintIndex]} isVisible={isVisible} />
    </div>
  )
}
