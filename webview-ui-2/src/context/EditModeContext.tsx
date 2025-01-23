import { createContext, useMemo, ReactNode, useState } from 'react';

interface EditModeContextValue {
  isEditMode: boolean;
  setIsEditMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const EditModeContext = createContext<EditModeContextValue | null>(null);

export const EditModeProvider = ({ children }: { children: ReactNode }) => {
  const [isEditMode, setIsEditMode] = useState(false);

  const value: EditModeContextValue = useMemo(() => ({ isEditMode, setIsEditMode }), [isEditMode, setIsEditMode]);

  return <EditModeContext.Provider value={value}>{children}</EditModeContext.Provider>;
};
  