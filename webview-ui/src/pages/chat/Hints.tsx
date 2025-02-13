import { useEffect, useState } from 'react'
import { HintMessage } from './HintMessage'

const hints = [
  {
    text: 'Drop images to chat by holding',
    shortcut: 'Shift'
  },
  {
    text: 'Quick access with',
    shortcut: '⌘+;'
  },
  {
    text: 'Add selected code to chat with',
    shortcut: '⌘+M'
  }
]

export const Hints = () => {
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsVisible(false) // Start fade out

      // Wait for fade out, then change hint and fade in
      setTimeout(() => {
        setCurrentHintIndex(current => (current + 1) % hints.length)
        setIsVisible(true)
      }, 1000) // This matches the fade-out duration
    }, 4000)

    return () => clearInterval(intervalId)
  }, [])

  return (
    <div className='relative my-6'>
      <HintMessage hint={hints[currentHintIndex]} isVisible={isVisible} />
    </div>
  )
}
