import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState
} from 'react'

export const OverlayContext = createContext<{
  activeMessageId: string | null
  setActiveMessageId: Dispatch<SetStateAction<string | null>>
} | null>(null)

export const OverlayProvider = ({ children }: { children: ReactNode }) => {
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null)

  useLayoutEffect(() => {
    if (activeMessageId) {
      const scrollContainer = document.querySelector('scroll-to-bottom')

      if (scrollContainer) {
        const currentScroll = scrollContainer.scrollTop

        const handleScroll = () => {
          if (scrollContainer.scrollTop !== currentScroll) {
            scrollContainer.scrollTop = currentScroll
          }
        }

        handleScroll()
        scrollContainer.addEventListener('scroll', handleScroll, {
          passive: true
        })

        return () => {
          scrollContainer.removeEventListener('scroll', handleScroll)
        }
      }
    }
  }, [activeMessageId])

  const value = useMemo(
    () => ({ activeMessageId, setActiveMessageId }),
    [activeMessageId]
  )

  return (
    <OverlayContext.Provider value={value}>
      {children}
      {activeMessageId && (
        <div className='fixed inset-0 bg-black/50 transition-opacity duration-200 z-40' />
      )}
    </OverlayContext.Provider>
  )
}

export function useOverlay() {
  const context = useContext(OverlayContext)

  if (!context) {
    throw new Error('Overlay context provider not set')
  }

  return context
}
