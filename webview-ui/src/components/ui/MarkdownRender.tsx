import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentDuplicateIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import Editor from 'react-simple-code-editor';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import { Button } from './Button';
import { cn } from '../../common/utils';
import { FileIcon } from '../../lib/utils';

interface MarkdownRenderProps {
  mdString: string;
  messageRole: string;
}

const MarkdownRender: React.FunctionComponent<MarkdownRenderProps> = ({ mdString, messageRole }) => {
  const [copyTip, setCopyTip] = useState('Copy code');
  console.log('mdString:', mdString, messageRole);

  let codeBlockIndex = 0;
  const fileName: string[] = [];
  const startLine: number[] = [];
  const endLine: number[] = [];

  // Pre-process mdString to extract file details
  const lines = mdString.split('\n');
  lines.forEach((line) => {
    if (line.includes('file=')) {
      const fileMatch = line.match(/file="([^"]+)"/);
      if (fileMatch) {
        const fileInfo = fileMatch[1];
        if (fileInfo.includes('#')) {
          const [filePath, lineNumbers] = fileInfo.split('#');
          fileName.push(filePath);
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
      className={messageRole !== 'assistant' ? 'flex gap-2 flex-wrap' : 'prose prose-sm text-sm dark:prose-invert'}
      components={{
        code({ inline, className, ...props }: any) {
          codeBlockIndex += 1;
          const hasLang = /language-(\w+)/.exec(className || '');
          const codeProp = String(props.children).replace(/\n$/, '');

          const currentFileName = fileName[codeBlockIndex - 1] || 'main.js';
          const currentStartLine = startLine[codeBlockIndex - 1];
          const currentEndLine = endLine[codeBlockIndex - 1];

          const cleanedCode = codeProp
            .replace(/<superflex_domain_knowledge>\n?/, '')
            .replace(/\n?<\/superflex_domain_knowledge>/, '')
            .trim();

          return !inline && hasLang ? (
            messageRole === 'assistant' ? (
              <div className="rounded-xl ml-2 mr-2 border-gray-600 border-[1px] bg-background  mt-4">
                <div className="flex align-middle gap-1 pt-1 pl-2 border-gray-600 border-b-[1px] pr-2">
                  <FileIcon height="19px" width="19px" filename={currentFileName} />

                  <p className="text-[11px] m-0 text-foreground truncate max-w-36">{currentFileName}</p>
                  {currentStartLine !== null && currentEndLine !== null && (
                    <p className="text-[11px] m-0 text-foreground truncate max-w-36">
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
                        <DocumentCheckIcon className="h-[14px] w-[14px] text-muted-foreground hover:text-foreground" />
                      ) : (
                        <Button size="xs" variant="text" className="p-0">
                          <DocumentDuplicateIcon className="h-[14px] w-[14px] text-muted-foreground hover:text-foreground" />
                        </Button>
                      )}
                    </CopyToClipboard>
                  </div>
                </div>

                <Editor
                  value={cleanedCode}
                  onValueChange={() => console.log('not editable')}
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
                  <FileIcon height="20px" width="20px" filename={currentFileName} />
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

export { MarkdownRender };
