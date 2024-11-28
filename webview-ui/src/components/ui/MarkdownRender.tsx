import React, { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentCheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

import { Role } from '../../../../shared/model';
import { cn, getFileName } from '../../common/utils';
import { Editor } from './Editor';
import { Button } from './Button';
import { FileIcon } from './FileIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';

interface FileHeaderProps extends React.PropsWithChildren {
  filePath: string;
}

export const FileHeader: React.FC<FileHeaderProps> = ({ filePath, children }) => {
  const [copyTip, setCopyTip] = useState('Copy code');

  return (
    <div className="flex items-center justify-between gap-4 px-1.5 border-b border-border bg-background/50 h-6">
      <div className="flex items-center gap-1 min-w-0">
        <FileIcon filePath={filePath} className="size-5" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p className="text-xs text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0">
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
        text={String(children)}
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

interface CodeBlockInfo {
  extension: string;
  filePath?: string;
  startLine?: number;
  endLine?: number;
}

interface CodeBlockProps extends React.PropsWithChildren {
  codeBlock?: CodeBlockInfo;
}

export const CodeBlock = ({ codeBlock, children }: CodeBlockProps) => {
  return (
    <div className="rounded-md border border-border bg-background mt-1">
      {codeBlock?.filePath && <FileHeader filePath={codeBlock.filePath}>{children}</FileHeader>}
      <Editor extension={codeBlock?.extension} filePath={codeBlock?.filePath}>
        {children}
      </Editor>
    </div>
  );
};

const Code = ({ inline, className, ...props }: any) => {
  const hasLang = /language-(\w+)(?::([^#]+))?(?:#(\d+)-(\d+))?/.exec(className || '');
  if (!inline && hasLang) {
    const [, extension, filePath, startLine, endLine] = hasLang;

    const codeBlock = useMemo(
      () => ({
        extension,
        ...(filePath && { filePath: filePath.trim() }),
        ...(startLine && { startLine: parseInt(startLine, 10) }),
        ...(endLine && { endLine: parseInt(endLine, 10) })
      }),
      [extension, filePath, startLine, endLine]
    );

    return <CodeBlock codeBlock={codeBlock}>{String(props.children).replace(/\n$/, '')}</CodeBlock>;
  }

  return <code className={cn('text-sm text-button-background', className)} {...props} />;
};

interface MarkdownRenderProps extends React.PropsWithChildren {
  role: Role;
}

export const MarkdownRender: React.FunctionComponent<MarkdownRenderProps> = ({ role, children }) => {
  return (
    <ReactMarkdown
      className={
        role !== Role.Assistant ? 'flex gap-2 flex-wrap' : 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
      }
      components={{ code: Code }}>
      {String(children)}
    </ReactMarkdown>
  );
};
