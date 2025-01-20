import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { EventRequestType, FilePayload } from '../../../shared/protocol';
import { usePostMessage } from '../hooks/usePostMessage';

interface FilesContextValue {
  selectedFiles: FilePayload[];
  previewedFile: FilePayload | null;
  fetchFiles: () => void;
  selectFile: (file: FilePayload) => void;
  deselectFile: (file: FilePayload) => void;
}

const FilesContext = createContext<FilesContextValue | null>(null);

export const FilesProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  const [selectedFiles, setSelectedFiles] = useState<FilePayload[]>([]);

  const selectFile = useCallback((file: FilePayload) => {
    setSelectedFiles((prev) => [...prev, file]);
  }, []);

  const deselectFile = useCallback((file: FilePayload) => {
    setSelectedFiles((prevSelectedFiles) => prevSelectedFiles.filter((selected) => selected.id !== file.id));
  }, []);

  const previewedFile: FilePayload | null = useMemo(() => {
    return null;
  }, []);

  const fetchFiles = useCallback(() => {
    postMessage(EventRequestType.FETCH_FILES);
  }, [postMessage]);

  const value: FilesContextValue = useMemo(
    () => ({ selectedFiles, previewedFile, fetchFiles, selectFile, deselectFile }),
    [selectedFiles, previewedFile, fetchFiles, selectFile, deselectFile]
  );

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>;
};

export function useFiles() {
  const context = useContext(FilesContext);

  if (!context) {
    throw new Error('Files context provider not set');
  }

  return context;
}
