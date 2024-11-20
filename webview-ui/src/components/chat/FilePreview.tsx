import React, { useEffect, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import Editor from 'react-simple-code-editor';

import { FilePayload } from '../../../../shared/protocol';
import { SyntaxHighlightedPre } from '../ui/MarkdownRender';

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
    <div className="rounded-md -mb-1 mt-1.5 mx-1.5 border border-border bg-background">
      <Editor
        className="text-xs font-mono max-h-60"
        value={content}
        disabled
        onValueChange={() => {}} // Not editable
        highlight={(code) => (
          <SyntaxHighlightedPre>
            <div dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(code).value }} />
          </SyntaxHighlightedPre>
        )}
        padding={10}
        style={{ overflowY: 'auto' }}
      />
    </div>
  );
};
