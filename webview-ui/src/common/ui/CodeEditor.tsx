import MonacoEditor, { type Monaco } from '@monaco-editor/react'
import { type ReactNode, useEffect, useMemo, useState } from 'react'
import { defineVSCodeTheme, getLanguageFromPath } from '../utils'

export const CodeEditor = ({
  extension,
  filePath,
  maxHeight,
  children
}: {
  extension?: string
  filePath?: string
  maxHeight?: number
  children: ReactNode
}) => {
  const [themeVersion, setThemeVersion] = useState(0)

  const lineCount = useMemo(
    () => String(children).split('\n').length,
    [children]
  )

  const calculatedHeight = useMemo(() => {
    const lineHeight = 18
    if (maxHeight) {
      return Math.min(lineCount * lineHeight + 18, maxHeight)
    }
    return lineCount * lineHeight + 18
  }, [lineCount, maxHeight])

  const fileLanguage = useMemo(() => {
    if (!(filePath || extension)) {
      return 'plaintext'
    }
    return getLanguageFromPath(filePath ?? extension ?? '')
  }, [filePath, extension])

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeVersion(prev => prev + 1)
      if (window.monaco) {
        defineVSCodeTheme(window.monaco)
        window.monaco.editor.setTheme('vscode-theme')
      }
    })

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    return () => observer.disconnect()
  }, [])

  const beforeMount = (monaco: Monaco) => {
    defineVSCodeTheme(monaco)
  }

  return (
    <MonacoEditor
      key={themeVersion}
      className='px-2'
      height={calculatedHeight}
      language={fileLanguage}
      value={String(children)}
      beforeMount={beforeMount}
      theme='vscode-theme'
      options={{
        padding: { top: 8, bottom: 8 },
        readOnly: true,
        minimap: { enabled: false },
        scrollbar: {
          useShadows: false,
          vertical: 'hidden',
          horizontalScrollbarSize: 8,
          alwaysConsumeMouseWheel: false,
          horizontal: 'hidden'
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
  )
}
