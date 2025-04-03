import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'
import type { ContinueCallback } from '../../../../common/utils'

export const FigmaPremiumModalContext = createContext<{
  isOpen: boolean
  setIsOpen: Dispatch<SetStateAction<boolean>>
  onContinue: ContinueCallback | null
  setOnContinue: Dispatch<SetStateAction<ContinueCallback | null>>
} | null>(null)

export const FigmaPremiumModalProvider = ({
  children
}: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [onContinue, setOnContinue] = useState<ContinueCallback | null>(null)

  const value = useMemo(
    () => ({ isOpen, setIsOpen, onContinue, setOnContinue }),
    [isOpen, onContinue]
  )

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
