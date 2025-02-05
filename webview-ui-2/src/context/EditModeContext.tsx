import {
  type ReactNode,
  createContext,
  useContext,
  useMemo,
  useState
} from 'react'

interface EditModeContextValue {
  isEditMode: boolean
  isDraft: boolean
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>
  setIsDraft: React.Dispatch<React.SetStateAction<boolean>>
}

export const EditModeContext = createContext<EditModeContextValue | null>(null)

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDraft, setIsDraft] = useState(false)

  const value: EditModeContextValue = useMemo(
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
