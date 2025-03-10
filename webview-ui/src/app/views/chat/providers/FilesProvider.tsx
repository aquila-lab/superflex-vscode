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
  EventResponseType,
  type FilePayload,
  type TypedEventResponseMessage
} from '../../../../../../shared/protocol'
import { SUPERFLEX_RULES_FILE_NAME } from '../../../../../../shared/common/constants'
import { useConsumeMessage } from '../../../layers/global/hooks/useConsumeMessage'
import { usePostMessage } from '../../../layers/global/hooks/usePostMessage'
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
  const { isEditMode, isMainTextarea } = useEditMode()

  const [manuallySelectedFiles, setManuallySelectedFiles] = useState<
    FilePayload[]
  >(files ?? [])
  const [currentFile, setCurrentFile] = useState<FilePayload | null>(null)
  const [previewedFile, setPreviewedFile] = useState<FilePayload | null>(null)
  const [superflexRules, setSuperflexRules] = useState<FilePayload | null>(null)

  const selectedFiles = useMemo(() => {
    const files: FilePayload[] = []

    if (superflexRules) {
      files.push(superflexRules)
    }

    files.push(
      ...manuallySelectedFiles.map(file =>
        file.id === currentFile?.id ? currentFile : file
      )
    )

    if (currentFile && !files.some(file => file.id === currentFile.id)) {
      files.push(currentFile)
    }

    return files
  }, [superflexRules, currentFile, manuallySelectedFiles])

  const clearManuallySelectedFiles = useCallback(
    () => setManuallySelectedFiles([]),
    []
  )

  const selectFile = useCallback(
    (file: FilePayload) => {
      setManuallySelectedFiles(prevSelectedFiles => {
        const isSelected = prevSelectedFiles.some(
          selected => selected.id === file.id
        )
        if (isSelected || file.id === currentFile?.id) {
          clearFileFromState(file)
          return prevSelectedFiles.filter(selected => selected.id !== file.id)
        }

        if (file.name === SUPERFLEX_RULES_FILE_NAME) {
          setSuperflexRules(prev => (prev?.id === file.id ? null : file))
          return prevSelectedFiles
        }

        return [...prevSelectedFiles, file]
      })
    },
    [currentFile]
  )

  const handleFiles = useCallback(
    ({ command, payload, error }: TypedEventResponseMessage) => {
      // CRITICAL: Proper error handling required!
      // Never remove this check it will break the app.
      if (error) {
        return
      }

      switch (command) {
        case EventResponseType.SET_CURRENT_OPEN_FILE: {
          if (isEditMode && isMainTextarea) {
            setCurrentFile(payload)
          }
          break
        }
        case EventResponseType.FETCH_SUPERFLEX_RULES: {
          if (isEditMode) {
            setSuperflexRules(payload)
          }
          break
        }
      }
    },
    [isEditMode, isMainTextarea]
  )

  const deselectFile = useCallback((file: FilePayload) => {
    clearFileFromState(file)
    setManuallySelectedFiles(prevSelectedFiles =>
      prevSelectedFiles.filter(selected => selected.id !== file.id)
    )
  }, [])

  const clearFileFromState = useCallback((file: FilePayload) => {
    setCurrentFile(curr => (curr?.id === file.id ? null : curr))
    setPreviewedFile(curr => (curr?.id === file.id ? null : curr))
    setSuperflexRules(curr => (curr?.id === file.id ? null : curr))
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

  useConsumeMessage(
    [
      EventResponseType.SET_CURRENT_OPEN_FILE,
      EventResponseType.FETCH_SUPERFLEX_RULES
    ],
    handleFiles
  )

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
