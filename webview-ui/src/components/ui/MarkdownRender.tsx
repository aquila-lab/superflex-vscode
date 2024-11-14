import React, { useContext, useState } from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import styled from 'styled-components';
import ReactMarkdown from 'react-markdown';
import Editor from 'react-simple-code-editor';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentDuplicateIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';

import { Role } from '../../../../shared/model';
import { cn } from '../../common/utils';
import { VscThemeContext } from '../../context/VscTheme';
import { Button } from './Button';
import { FileIcon } from './FileIcon';

const StyledPre = styled.pre<{ theme: Record<string, string> }>`
  & .hljs {
    color: var(--vscode-editor-foreground);
  }

  margin-top: 0;
  margin-bottom: 0;
  border-radius: 0 0 5px 5px !important;

  ${({ theme }) =>
    Object.entries(theme)
      .map(([key, value]) => `& ${key} { color: ${value}; }`)
      .join('\n')}
`;

interface SyntaxHighlightedPreProps extends React.HTMLAttributes<HTMLPreElement> {
  className?: string;
}

export const SyntaxHighlightedPre: React.FC<SyntaxHighlightedPreProps> = ({ className, ...props }) => {
  const currentTheme = useContext(VscThemeContext);

  return <StyledPre className={className} theme={currentTheme} {...props} />;
};
interface MarkdownRenderProps {
  role: Role;
  mdString: string;
}

export const MarkdownRender: React.FunctionComponent<MarkdownRenderProps> = ({ role, mdString }) => {
  const [copyTip, setCopyTip] = useState('Copy code');

  let codeBlockIndex = 0;
  const fileName: string[] = [];
  const startLine: number[] = [];
  const endLine: number[] = [];

  mdString = mdString
    .replace(/<user_selected_code>\n?/, '')
    .replace(/\n?<\/user_selected_code>/, '')
    .trimStart()
    .trimEnd();

  // Pre-process mdString to extract file details
  const lines = mdString.split('\n');
  lines.forEach((line) => {
    if (line.includes('file=')) {
      const fileMatch = line.match(/file="([^"]+)"/);

      if (fileMatch) {
        const fileInfo = fileMatch[1];

        if (fileInfo.includes('#')) {
          const [filePath, lineNumbers] = fileInfo.split('#');
          fileName.push(filePath.split(/[/\\]/).pop() ?? 'text');

          if (lineNumbers && lineNumbers.includes('-')) {
            const [start, end] = lineNumbers.split('-');
            startLine.push(parseInt(start, 10));
            endLine.push(parseInt(end, 10));
          }
        } else {
          fileName.push(fileInfo);
          startLine.push(0);
          endLine.push(0);
        }
      }
    }
  });

  return (
    <ReactMarkdown
      className={role !== Role.Assistant ? 'flex gap-2 flex-wrap' : 'prose prose-sm text-sm dark:prose-invert'}
      components={{
        code({ inline, className, ...props }: any) {
          codeBlockIndex += 1;
          const hasLang = /language-(\w+)/.exec(className || '');
          const codeProp = String(props.children).replace(/\n$/, '');

          const currentFileName = fileName[codeBlockIndex - 1] || 'text';
          const currentStartLine = startLine[codeBlockIndex - 1];
          const currentEndLine = endLine[codeBlockIndex - 1];

          return !inline && hasLang ? (
            role === Role.Assistant ? (
              <div className="rounded-md mx-2 mt-4 border border-border bg-background">
                <div className="flex align-middle gap-1 pt-1 px-2 border-b border-border">
                  <FileIcon filename={currentFileName} className="size-5" />

                  <p className="text-xs text-foreground truncate max-w-36">{currentFileName}</p>
                  {currentStartLine && currentEndLine && (
                    <p className="text-xs text-foreground">
                      ({currentStartLine}-{currentEndLine})
                    </p>
                  )}

                  <div className="ml-auto">
                    <CopyToClipboard
                      text={codeProp}
                      onCopy={async () => {
                        setCopyTip('Copied');
                        await new Promise((resolve) => setTimeout(resolve, 5000));
                        setCopyTip('Copy code');
                      }}>
                      {copyTip === 'Copied' ? (
                        <DocumentCheckIcon className="size-4 text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Button size="xs" variant="text" className="p-0">
                          <DocumentDuplicateIcon className="size-4 text-muted-foreground hover:text-foreground" />
                        </Button>
                      )}
                    </CopyToClipboard>
                  </div>
                </div>

                <Editor
                  value={codeProp}
                  onValueChange={() => {}}
                  highlight={(code) =>
                    // <SyntaxHighlightedPre>
                    //   <div dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(code).value }} />
                    // </SyntaxHighlightedPre>
                    hljs.highlightAuto(code).value
                  }
                  padding={10}
                  style={{
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12
                  }}
                />
              </div>
            ) : (
              <div className="flex items-center gap-1 bg-background rounded-md px-1.5 py-[1px]">
                <div className="flex flex-row items-center gap-1 hover:cursor-pointer">
                  <FileIcon filename={currentFileName} className="size-5" />
                  <p className="text-xs text-muted-foreground truncate max-w-36">{currentFileName}</p>
                  {currentStartLine !== null && currentEndLine !== null && (
                    <p className="text-xs text-muted-foreground truncate max-w-36">
                      {`(${currentStartLine}-${currentEndLine})`}
                    </p>
                  )}
                  <p className="text-xs text-muted-secondary-foreground">File</p>
                </div>
              </div>
            )
          ) : (
            <code className={cn('text-sm', className)} {...props} />
          );
        }
      }}>
      {mdString}
    </ReactMarkdown>
  );
};
