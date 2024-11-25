import React, { useEffect, useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';

import { FilePayload } from '../../../../shared/protocol';

declare global {
  interface Window {
    monaco: any;
  }
}

interface FilePreviewProps {
  file: FilePayload;
  fetchFileContent: (file: FilePayload) => Promise<string>;
}

const defineVSCodeTheme = (monaco: any) => {
  monaco.editor.defineTheme('vscode-theme', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': getComputedStyle(document.body).getPropertyValue('--vscode-editor-background'),
      'editor.foreground': getComputedStyle(document.body).getPropertyValue('--vscode-editor-foreground'),
      'editor.lineHighlightBackground': getComputedStyle(document.body).getPropertyValue(
        '--vscode-editor-lineHighlightBackground'
      ),
      'editorLineNumber.foreground': getComputedStyle(document.body).getPropertyValue(
        '--vscode-editorLineNumber-foreground'
      ),
      'editor.selectionBackground': getComputedStyle(document.body).getPropertyValue(
        '--vscode-editor-selectionBackground'
      )
    }
  });
};

export const FilePreview: React.FC<FilePreviewProps> = ({ file, fetchFileContent }) => {
  const [content, setContent] = useState(file?.content ?? '');
  const [themeVersion, setThemeVersion] = useState(0);

  const calculatedHeight = useMemo(() => {
    const lineHeight = 18;
    const lineCount = content.split('\n').length;
    return Math.min(lineCount * lineHeight, 240);
  }, [content]);

  const beforeMount = (monaco: any) => {
    defineVSCodeTheme(monaco);
  };

  useEffect(() => {
    if (!file.endLine) {
      const loadContent = async () => {
        const newContent = await fetchFileContent(file);
        setContent(newContent);
      };
      loadContent();
    }
  }, [file, fetchFileContent]);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion((prev) => prev + 1);
      if (window.monaco) {
        defineVSCodeTheme(window.monaco);
        window.monaco.editor.setTheme('vscode-theme');
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="rounded-md -mb-1 mt-1.5 mx-1.5 bg-background border border-accent">
      <div className="max-h-60 overflow-hidden">
        <Editor
          key={themeVersion}
          className="p-2"
          height={`${calculatedHeight}px`}
          defaultLanguage="typescript"
          value={content}
          beforeMount={beforeMount}
          theme="vscode-theme"
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
