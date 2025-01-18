import { createContext, useContext, useState, useCallback, ReactNode, useMemo } from 'react';
import { FigmaFile, EventRequestType } from '../../../shared/protocol';
import { usePostMessage } from '../hooks/usePostMessage';

interface ChatAttachmentContextValue {
  imageAttachment?: File;
  figmaAttachment?: FigmaFile;
  isFigmaFileLoading: boolean;
  setImageAttachment: (file?: File) => void;
  setFigmaAttachment: (file?: FigmaFile) => void;
  handleFigmaFileSelection: (figmaSelectionLink: string) => void;
  clearAttachments: () => void;
}

const ChatAttachmentContext = createContext<ChatAttachmentContextValue | null>(null);

export const ChatAttachmentProvider = ({ children }: { children: ReactNode }) => {
  const postMessage = usePostMessage();
  const [imageAttachment, setImageAttachment] = useState<File>();
  const [figmaAttachment, setFigmaAttachment] = useState<FigmaFile>();
  const [isFigmaFileLoading, setIsFigmaFileLoading] = useState(false);

  const handleFigmaFileSelection = useCallback(
    (figmaSelectionLink: string) => {
      const figmaFile: FigmaFile = {
        selectionLink: figmaSelectionLink,
        imageUrl: '',
        isLoading: true
      };

      setIsFigmaFileLoading(true);
      setFigmaAttachment(figmaFile);
      setImageAttachment(undefined);

      postMessage(EventRequestType.FIGMA_FILE_SELECTED, figmaFile);
    },
    [postMessage]
  );

  const clearAttachments = useCallback(() => {
    setImageAttachment(undefined);
    setFigmaAttachment(undefined);
  }, []);

  const value = useMemo(
    () => ({
      imageAttachment,
      figmaAttachment,
      isFigmaFileLoading,
      setImageAttachment,
      setFigmaAttachment,
      handleFigmaFileSelection,
      clearAttachments
    }),
    [
      imageAttachment,
      figmaAttachment,
      isFigmaFileLoading,
      setImageAttachment,
      setFigmaAttachment,
      handleFigmaFileSelection,
      clearAttachments
    ]
  );

  return <ChatAttachmentContext.Provider value={value}>{children}</ChatAttachmentContext.Provider>;
};

export const useAttachments = () => {
  const context = useContext(ChatAttachmentContext);

  if (!context) throw new Error('useAttachments must be used within ChatAttachmentProvider');
  
  return context;
};
