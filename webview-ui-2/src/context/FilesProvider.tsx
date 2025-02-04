import { createContext, Dispatch, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { EventRequestType, EventResponseMessage, EventResponseType, FilePayload } from '../../../shared/protocol';
import { useConsumeMessage } from '../hooks/useConsumeMessage';
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

export const FilesProvider = ({ files, children }: { files?: FilePayload[]; children: ReactNode }) => {
  const postMessage = usePostMessage();

  const [manuallySelectedFiles, setManuallySelectedFiles] = useState<FilePayload[]>(files ?? []);
  const [previewedFile, setPreviewedFile] = useState<FilePayload | null>(null);
  const [currentFile, setCurrentFile] = useState<FilePayload | null>(null);

  const selectedFiles = useMemo(() => {
    const files = manuallySelectedFiles.map((file) => (file.id === currentFile?.id ? currentFile : file));

    if (currentFile && !files.some((file) => file.id === currentFile.id)) {
      files.push(currentFile);
    }

    return files;
  }, [manuallySelectedFiles, currentFile]);

  const selectFile = useCallback((file: FilePayload) => {
    setManuallySelectedFiles((prevSelectedFiles) => {
      const isSelected = prevSelectedFiles.some((selected) => selected.id === file.id);
      if (isSelected) {
        setPreviewedFile((curr) => (curr?.id === file.id ? null : curr));
        return prevSelectedFiles.filter((selected) => selected.id !== file.id);
      } else {
        return [...prevSelectedFiles, file];
      }
    });
  }, []);

  const handleNewOpenFile = useCallback(
    ({ payload }: EventResponseMessage<EventResponseType.SET_CURRENT_OPEN_FILE>) => {
      setCurrentFile(payload);
    },
    []
  );

  const deselectFile = useCallback((file: FilePayload) => {
    setManuallySelectedFiles((prevSelectedFiles) => prevSelectedFiles.filter((selected) => selected.id !== file.id));
    setCurrentFile((curr) => (curr?.id === file.id ? null : curr));
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

  useConsumeMessage(EventResponseType.SET_CURRENT_OPEN_FILE, handleNewOpenFile);

  const value: FilesContextValue = useMemo(
    () => ({
      selectedFiles,
      previewedFile,
      fetchFiles,
      fetchFileContent,
      selectFile,
      deselectFile,
      setPreviewedFile
    }),
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
