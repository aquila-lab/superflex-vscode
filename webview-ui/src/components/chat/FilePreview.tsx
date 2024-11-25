import React, { useEffect, useState } from 'react';

import { FilePayload } from '../../../../shared/protocol';
import { Editor } from '../ui/Editor';

interface FilePreviewProps {
  file: FilePayload;
  fetchFileContent: (file: FilePayload) => Promise<string>;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, fetchFileContent }) => {
  const [content, setContent] = useState(file?.content ?? '');

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
        <Editor path={file.relativePath} content={content} maxHeight={240} />
      </div>
    </div>
  );
};
