import React, { useEffect, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import Editor from 'react-simple-code-editor';

import { FilePayload } from '../../../../shared/protocol';

interface FilePreviewProps {
  file: FilePayload;
  fetchFileContent: (file: FilePayload) => Promise<string>;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, fetchFileContent }) => {
  const [content, setContent] = useState(file?.content ?? '');

  useEffect(() => {
    if (!file.endLine) {
      loadFileContent();
    }
  }, [file]);

  async function loadFileContent() {
    const content = await fetchFileContent(file);
    setContent(content);
  }

  return (
    <div className="rounded-md -mb-1 mt-1.5 mx-1.5 bg-background border border-accent">
      <Editor
        className="text-xs font-mono max-h-60"
        value={content}
        disabled
        onValueChange={() => {}} // Not editable
        highlight={(code) => hljs.highlightAuto(code).value}
        padding={10}
        style={{ overflowY: 'auto' }}
      />
    </div>
  );
};
