import React, { useState, useMemo, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentCheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

import { Role } from '../../../../shared/model';
import { cn, getFileName } from '../../common/utils';
import { Editor } from './Editor';
import { Button } from './Button';
import { FileIcon } from './FileIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

interface FileHeaderProps {
  filePath: string;
  content: string;
}

export const FileHeader: React.FC<FileHeaderProps> = ({ filePath, content }) => {
  const [copyTip, setCopyTip] = useState('Copy code');

  return (
    <div className="flex items-center justify-between gap-4 px-1.5 border-b border-border bg-background/50">
      <div className="flex items-center gap-1 min-w-0">
        <FileIcon filePath={filePath} className="size-5" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0 py-1">
                {getFileName(filePath)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs m-0 text-muted-foreground">{filePath}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <CopyToClipboard
        text={content}
        onCopy={async () => {
          setCopyTip('Copied');
          setTimeout(() => setCopyTip('Copy code'), 5000);
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
  );
};

interface CodeBlockProps {
  filePath: string;
  code: string;
}

export const CodeBlock = memo(({ filePath, code }: CodeBlockProps) => {
  return (
    <div className="rounded-md border border-border bg-background">
      <FileHeader filePath={filePath} content={code} />
      <Editor filePath={filePath} content={code} />
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

interface CodeBlockInfo {
  filePath: string;
  startLine?: number;
  endLine?: number;
}

export const parseCodeBlockInfo = (fileAttribute: string): CodeBlockInfo => {
  if (!fileAttribute) {
    return { filePath: '' };
  }

  const [filePath, lineNumbers] = fileAttribute.split('#');
  if (!lineNumbers) {
    return { filePath };
  }

  const [start, end] = lineNumbers.split('-').map(Number);
  return {
    filePath,
    startLine: start,
    endLine: end
  };
};

export const extractCodeBlockDetails = (mdString: string): { codeBlocks: CodeBlockInfo[] } => {
  const codeBlocks: CodeBlockInfo[] = [];
  const lines = mdString.split('\n');

  lines.forEach((line) => {
    const fileMatch = line.match(/file="([^"]+)"/);
    if (fileMatch) {
      const fileInfo = parseCodeBlockInfo(fileMatch[1]);
      codeBlocks.push(fileInfo);
    }
  });

  return { codeBlocks };
};

interface MarkdownRenderProps {
  role: Role;
  mdString: string;
}

export const MarkdownRender: React.FunctionComponent<MarkdownRenderProps> = ({ role, mdString }) => {
  const cleanedMdString = useMemo(() => {
    return mdString.trimStart().trimEnd();
  }, [mdString]);

  const { codeBlocks } = useMemo(() => extractCodeBlockDetails(cleanedMdString), [cleanedMdString]);

  let codeBlockIndex = 0;

  return (
    <ReactMarkdown
      className={
        role !== Role.Assistant ? 'flex gap-2 flex-wrap' : 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
      }
      components={{
        code({ inline, className, ...props }: any) {
          const hasLang = /language-(\w+)/.exec(className || '');
          const codeProp = String(props.children).replace(/\n$/, '');

          if (!inline && hasLang) {
            if (role === Role.Assistant) {
              const currentBlock = codeBlocks[codeBlockIndex];
              codeBlockIndex += 1;

              return <CodeBlock filePath={currentBlock.filePath} code={codeProp} />;
            }

            const currentBlock = codeBlocks[codeBlockIndex];
            codeBlockIndex += 1;

            return (
              <div className="flex items-center gap-1 bg-background rounded-md px-1.5 py-[1px]">
                <div className="flex flex-row items-center gap-1 hover:cursor-pointer">
                  <FileIcon filePath={currentBlock.filePath} className="size-5" />
                  <p className="text-xs text-muted-foreground truncate max-w-36">
                    {getFileName(currentBlock.filePath)}
                  </p>
                  {currentBlock.startLine && currentBlock.endLine && (
                    <p className="text-xs text-muted-foreground truncate max-w-36">
                      ({currentBlock.startLine}-{currentBlock.endLine})
                    </p>
                  )}
                  <p className="text-xs text-muted-secondary-foreground">File</p>
                </div>
              </div>
            );
          }

          return <code className={cn('text-sm', className)} {...props} />;
        }
      }}>
      {cleanedMdString}
    </ReactMarkdown>
  );
};
