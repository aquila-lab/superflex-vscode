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

export const FigmaPremiumModalContext = createContext<{
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
} | null>(null)

export const FigmaPremiumModalProvider = ({
  children
}: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)

  const value = useMemo(() => ({ isOpen, setIsOpen }), [isOpen])

  return (
    <FigmaPremiumModalContext.Provider value={value}>
      {children}
    </FigmaPremiumModalContext.Provider>
  )
}

export function useFigmaPremiumModal() {
  const context = useContext(FigmaPremiumModalContext)

  if (!context) {
    throw new Error('FigmaPremiumModal context provider not set')
  }

  return context
}
