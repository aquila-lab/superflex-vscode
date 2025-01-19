import { useCallback, useEffect, useState } from 'react';
import { FilePayload } from '../../../../shared/protocol';
import { Editor } from './Editor';

export const FilePreview = ({ file }: { file: FilePayload }) => {
  const [content, setContent] = useState(file?.content ?? '');

  const fetchFileContent = useCallback(async (file: FilePayload) => {
    return '';
  }, []);

  useEffect(() => {
    if (!file.endLine) {
      const loadContent = async () => {
        const newContent = await fetchFileContent(file);
        setContent(newContent);
      };
      loadContent();
    }
  }, [file, fetchFileContent]);

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
