import React, { useEffect, useMemo, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';

declare global {
  interface Window {
    monaco: any;
  }
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

const getLanguageFromPath = (filePath: string): string => {
  const extension = filePath.split('.').pop()?.toLowerCase() ?? '';

  const languageMap: Record<string, string> = {
    // JavaScript/TypeScript
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',

    // Styling
    css: 'css',
    scss: 'scss',
    sass: 'scss',
    less: 'less',
    stylus: 'stylus',

    // Markup/Template
    html: 'html',
    htm: 'html',
    vue: 'vue',
    svelte: 'svelte',

    // Config files
    json: 'json',
    yaml: 'yaml',
    yml: 'yaml',
    toml: 'toml',
    env: 'plaintext',

    // Package managers
    lock: 'yaml',
    packagejson: 'json',

    // Shell scripts
    sh: 'shell',
    bash: 'shell',

    // Other web technologies
    md: 'markdown',
    graphql: 'graphql',
    gql: 'graphql'
  };

  return languageMap[extension] || 'plaintext';
};

interface EditorProps extends React.PropsWithChildren {
  extension?: string;
  filePath?: string;
  maxHeight?: number;
}

export const Editor = ({ extension, filePath, maxHeight, children }: EditorProps) => {
  const [themeVersion, setThemeVersion] = useState(0);

  const lineCount = useMemo(() => String(children).split('\n').length, [children]);

  const calculatedHeight = useMemo(() => {
    const lineHeight = 18;
    if (maxHeight) {
      return Math.min(lineCount * lineHeight + 18, maxHeight);
    }
    return lineCount * lineHeight + 18;
  }, [lineCount, maxHeight]);

  const fileLanguage = useMemo(() => {
    if (!filePath && !extension) {
      return 'plaintext';
    }
    return getLanguageFromPath(filePath ?? extension ?? '');
  }, [filePath, extension]);

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

  const beforeMount = (monaco: any) => {
    defineVSCodeTheme(monaco);
  };

  return (
    <MonacoEditor
      key={themeVersion}
      className="px-2"
      height={calculatedHeight}
      language={fileLanguage}
      value={String(children)}
      beforeMount={beforeMount}
      theme="vscode-theme"
      options={{
        padding: { top: 8, bottom: 8 },
        readOnly: true,
        minimap: { enabled: false },
        scrollbar: {
          useShadows: false,
          vertical: 'hidden',
          horizontalScrollbarSize: 8,
          alwaysConsumeMouseWheel: false
        },
        scrollBeyondLastLine: false,
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
        fontLigatures: false,
        showUnused: false,
        hover: { enabled: false },
        contextmenu: false,
        quickSuggestions: false,
        parameterHints: { enabled: false },
        tabCompletion: 'off',
        mouseWheelZoom: false,
        renderValidationDecorations: 'off',
        renderFinalNewline: 'off'
      }}
    />
  );
};
