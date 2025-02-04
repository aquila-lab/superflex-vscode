import { useCallback, useEffect, useState } from 'react';
import { Editor } from './Editor';
import { useFiles } from '../../context/FilesProvider';
import { EventResponseType, EventResponseMessage } from '../../../../shared/protocol';
import { useConsumeMessage } from '../../hooks/useConsumeMessage';

export const FilePreview = () => {
  const { previewedFile: file, fetchFileContent } = useFiles();
  const [content, setContent] = useState(file?.content ?? '');

  const handleFetchFileContent = useCallback(
    ({ payload }: EventResponseMessage<EventResponseType.FETCH_FILE_CONTENT>) => {
      if (payload) {
        setContent(payload);
      }
    },
    []
  );

  useConsumeMessage(EventResponseType.FETCH_FILE_CONTENT, handleFetchFileContent);

  useEffect(() => {
    if (file) {
      fetchFileContent(file);
    }
  }, [file, fetchFileContent]);

  if (!file || !content) return null;

  return (
    <div className="rounded-md -mb-1 mt-1.5 mx-1.5 bg-background border border-accent">
      <div className="max-h-60 overflow-hidden">
        <Editor filePath={file.relativePath} maxHeight={240}>
          {content}
        </Editor>
      </div>
    </div>
  );
};
