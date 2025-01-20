import { createContext, Dispatch, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { EventRequestType, FilePayload } from '../../../shared/protocol';
import { usePostMessage } from '../hooks/usePostMessage';

interface FilesContextValue {
  selectedFiles: FilePayload[];
  previewedFile: FilePayload | null;
  fetchFiles: () => void;
  fetchFileContent: (file: FilePayload) => void;
  setPreviewedFile: Dispatch<React.SetStateAction<FilePayload | null>>;
  selectFile: (file: FilePayload) => void;
  deselectFile: (file: FilePayload) => void;
}

const FilesContext = createContext<FilesContextValue | null>(null);

export const FilesProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  const [selectedFiles, setSelectedFiles] = useState<FilePayload[]>([]);
  const [previewedFile, setPreviewedFile] = useState<FilePayload | null>(null);

  const selectFile = useCallback((file: FilePayload) => {
    setSelectedFiles((prevSelectedFiles) => {
      const isSelected = prevSelectedFiles.some((selected) => selected.id === file.id);
      if (isSelected) {
        setPreviewedFile((curr) => (curr?.id === file.id ? null : curr));
        return prevSelectedFiles.filter((selected) => selected.id !== file.id);
      } else {
        return [...prevSelectedFiles, file];
      }
    });
  }, []);

  const deselectFile = useCallback((file: FilePayload) => {
    setSelectedFiles((prevSelectedFiles) => prevSelectedFiles.filter((selected) => selected.id !== file.id));
    setPreviewedFile((curr) => (curr?.id === file.id ? null : curr));
  }, []);

  const fetchFiles = useCallback(() => {
    postMessage(EventRequestType.FETCH_FILES);
  }, [postMessage]);

  const fetchFileContent = useCallback(
    (file: FilePayload) => {
      postMessage(EventRequestType.FETCH_FILE_CONTENT, file);
    },
    [postMessage]
  );

  const value: FilesContextValue = useMemo(
    () => ({ selectedFiles, previewedFile, fetchFiles, fetchFileContent, selectFile, deselectFile, setPreviewedFile }),
    [selectedFiles, previewedFile, fetchFiles, fetchFileContent, selectFile, deselectFile, setPreviewedFile]
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
