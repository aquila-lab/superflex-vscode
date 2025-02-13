import {
  type Dispatch,
  type ReactNode,
  type SetStateAction,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import {
  EventRequestType,
  type EventResponseMessage,
  EventResponseType,
  type FilePayload
} from '../../../../../../shared/protocol'
import { useConsumeMessage } from '../../../layer/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layer/global/hooks/usePostMessage'
import { useEditMode } from './EditModeProvider'

const FilesContext = createContext<{
  selectedFiles: FilePayload[]
  previewedFile: FilePayload | null
  fetchFiles: () => void
  fetchFileContent: (file: FilePayload) => void
  setPreviewedFile: Dispatch<SetStateAction<FilePayload | null>>
  selectFile: (file: FilePayload) => void
  deselectFile: (file: FilePayload) => void
  clearManuallySelectedFiles: () => void
} | null>(null)

export const FilesProvider = ({
  files,
  children
}: { files?: FilePayload[]; children: ReactNode }) => {
  const postMessage = usePostMessage()
  const { isEditMode, isMainTextbox } = useEditMode()

  const [manuallySelectedFiles, setManuallySelectedFiles] = useState<
    FilePayload[]
  >(files ?? [])
  const [previewedFile, setPreviewedFile] = useState<FilePayload | null>(null)
  const [currentFile, setCurrentFile] = useState<FilePayload | null>(null)

  const selectedFiles = useMemo(() => {
    const files = manuallySelectedFiles.map(file =>
      file.id === currentFile?.id ? currentFile : file
    )

    if (currentFile && !files.some(file => file.id === currentFile.id)) {
      files.push(currentFile)
    }

    return files
  }, [manuallySelectedFiles, currentFile])

  const clearManuallySelectedFiles = useCallback(
    () => setManuallySelectedFiles([]),
    []
  )

  const selectFile = useCallback((file: FilePayload) => {
    setManuallySelectedFiles(prevSelectedFiles => {
      const isSelected = prevSelectedFiles.some(
        selected => selected.id === file.id
      )
      if (isSelected) {
        setPreviewedFile(curr => (curr?.id === file.id ? null : curr))
        return prevSelectedFiles.filter(selected => selected.id !== file.id)
      }
      return [...prevSelectedFiles, file]
    })
  }, [])

  const handleNewOpenFile = useCallback(
    ({
      payload
    }: EventResponseMessage<EventResponseType.SET_CURRENT_OPEN_FILE>) => {
      if (isEditMode && payload && isMainTextbox) {
        setCurrentFile(payload)
      }
    },
    [isEditMode, isMainTextbox]
  )

  const deselectFile = useCallback((file: FilePayload) => {
    setManuallySelectedFiles(prevSelectedFiles =>
      prevSelectedFiles.filter(selected => selected.id !== file.id)
    )
    setCurrentFile(curr => (curr?.id === file.id ? null : curr))
    setPreviewedFile(curr => (curr?.id === file.id ? null : curr))
  }, [])

  const fetchFiles = useCallback(() => {
    postMessage(EventRequestType.FETCH_FILES)
  }, [postMessage])

  const fetchFileContent = useCallback(
    (file: FilePayload) => {
      postMessage(EventRequestType.FETCH_FILE_CONTENT, file)
    },
    [postMessage]
  )

  useConsumeMessage(EventResponseType.SET_CURRENT_OPEN_FILE, handleNewOpenFile)

  const value = useMemo(
    () => ({
      selectedFiles,
      previewedFile,
      fetchFiles,
      fetchFileContent,
      selectFile,
      deselectFile,
      setPreviewedFile,
      clearManuallySelectedFiles
    }),
    [
      selectedFiles,
      previewedFile,
      fetchFiles,
      fetchFileContent,
      selectFile,
      deselectFile,
      clearManuallySelectedFiles
    ]
  )

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>
}

export function useFiles() {
  const context = useContext(FilesContext)

  if (!context) {
    throw new Error('Files context provider not set')
  }

  return context
}
