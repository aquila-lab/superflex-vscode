import React, { useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

import { FilePayload } from '../../../../shared/protocol';

interface FilePreviewProps {
  file: FilePayload;
  fetchFileContent: (file: FilePayload) => Promise<string>;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, fetchFileContent }) => {
  const [content, setContent] = useState(file?.content ?? '');

  // Calculate height based on content lines
  const lineHeight = 18; // Monaco editor default line height
  const lineCount = content.split('\n').length;
  const calculatedHeight = Math.min(lineCount * lineHeight + 16, 240); // cap at 240px (max-h-60)

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
      <div className="max-h-60 overflow-hidden">
        <Editor
          className="p-2"
          height={`${calculatedHeight}px`}
          defaultLanguage="typescript"
          value={content}
          theme="vs-dark"
          options={{
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            scrollbar: { vertical: 'hidden' },
            fontSize: 12,
            lineNumbers: 'off',
            folding: false,
            renderWhitespace: 'none',
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            renderLineHighlight: 'none',
            occurrencesHighlight: 'off',
            selectionHighlight: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 0,
            glyphMargin: false,
            fontFamily: 'Menlo, Monaco, "Courier New", monospace',
            fontLigatures: false
          }}
        />
      </div>
    </div>
  );
};
