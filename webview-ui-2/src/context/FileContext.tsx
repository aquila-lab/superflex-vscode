import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { FilePayload, EventRequestType } from '../../../shared/protocol';
import { usePostMessage } from '../hooks/usePostMessage';

interface FileContextValue {
  selectedFiles: FilePayload[];
  currentOpenFile: FilePayload | null;
  addSelectedFile: (file: FilePayload) => void;
  removeSelectedFile: (fileId: string) => void;
  setSelectedFiles: (files: FilePayload[]) => void;
  setCurrentOpenFile: (file: FilePayload | null) => void;
  fetchFiles: () => Promise<void>;
  fetchFileContent: (file: FilePayload) => Promise<string>;
  openFile: (filePath: string) => void;
}

const FileContext = createContext<FileContextValue | null>(null);

export const FileProvider = ({ children }: { children: ReactNode }) => {
  const postMessage  = usePostMessage();
  const [selectedFiles, setSelectedFiles] = useState<FilePayload[]>([]);
  const [currentOpenFile, setCurrentOpenFile] = useState<FilePayload | null>(null);

  const addSelectedFile = useCallback((file: FilePayload) => {
    setSelectedFiles((prev) => {
      if (prev.some((f) => f.id === file.id)) return prev;
      return [...prev, file];
    });
  }, []);

  const removeSelectedFile = useCallback((fileId: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== fileId));
  }, []);

  const fetchFiles = useCallback(async () => {
    postMessage(EventRequestType.FETCH_FILES);
  }, [postMessage]);

  const fetchFileContent = useCallback(async (file: FilePayload): Promise<string> => {
    return '';
  }, []);

  const openFile = useCallback(
    (filePath: string) => {
      postMessage(EventRequestType.OPEN_FILE, { filePath });
    },
    [postMessage]
  );

  const value = useMemo(
    () => ({
      selectedFiles,
      currentOpenFile,
      addSelectedFile,
      removeSelectedFile,
      setSelectedFiles,
      setCurrentOpenFile,
      fetchFiles,
      fetchFileContent,
      openFile
    }),
    [
      selectedFiles,
      currentOpenFile,
      addSelectedFile,
      removeSelectedFile,
      setSelectedFiles,
      setCurrentOpenFile,
      fetchFiles,
      fetchFileContent,
      openFile
    ]
  );

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};

export const useFiles = () => {
  const context = useContext(FileContext);

  if (!context) throw new Error('useFiles must be used within FileProvider');

  return context;
};
