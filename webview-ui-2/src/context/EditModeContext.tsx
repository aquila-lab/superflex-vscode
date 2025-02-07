import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'

export const EditModeContext = createContext<{
  isEditMode: boolean
  isDraft: boolean
  setIsEditMode: Dispatch<SetStateAction<boolean>>
  setIsDraft: Dispatch<SetStateAction<boolean>>
} | null>(null)

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  const value = useMemo(
    () => ({ isEditMode, isDraft, setIsEditMode, setIsDraft }),
    [isEditMode, isDraft]
  )

  return (
    <EditModeContext.Provider value={value}>
      {children}
    </EditModeContext.Provider>
  )
}

export function useEditMode() {
  const context = useContext(EditModeContext)

  if (!context) {
    return {
      isEditMode: true,
      isDraft: false,
      setIsEditMode: () => {},
      setIsDraft: () => {}
    }
  }

  return context
}
