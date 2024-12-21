import React, { useState, useMemo, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CheckIcon, DocumentDuplicateIcon, PlayIcon } from '@heroicons/react/24/outline';

import { Role } from '../../../../shared/model';
import { cn, getFileName } from '../../common/utils';
import { Editor } from './Editor';
import { Button } from './Button';
import { FileIcon } from './FileIcon';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './Tooltip';
import { Spinner } from './Spinner';
import { Separator } from './Separator';

interface FileHeaderProps extends React.PropsWithChildren {
  filePath: string;
  isStreaming: boolean;
  onFileNameClick?: (filePath: string) => void;
  onFastApplyClick?: (filePath: string, edits: string) => Promise<void>;
  onAcceptAllChanges?: (filePath: string) => void;
  onRejectAllChanges?: (filePath: string) => void;
}

type ApplyState = 'idle' | 'applying' | 'applied';

export const FileHeader: React.FC<FileHeaderProps> = ({
  filePath,
  isStreaming,
  onFileNameClick = () => {},
  onFastApplyClick,
  onAcceptAllChanges = () => {},
  onRejectAllChanges = () => {},
  children
}) => {
  const [copyTip, setCopyTip] = useState('Copy code');
  const [applyState, setApplyState] = useState<ApplyState>('idle');

  async function handleApplyClick() {
    if (!onFastApplyClick) return;

    setApplyState('applying');
    await onFastApplyClick(filePath, String(children));
    setApplyState('applied');
  }

  const handleAcceptAll = () => {
    onAcceptAllChanges(filePath);
    setApplyState('idle');
  };

  const handleRejectAll = () => {
    onRejectAllChanges(filePath);
    setApplyState('idle');
  };

  return (
    <div className="flex items-center justify-between gap-4 px-1 rounded-t-md border-b border-border bg-sidebar h-6">
      <div className="flex items-center gap-1 min-w-0">
        <FileIcon filePath={filePath} className="size-4" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className="text-[11px] text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0 cursor-pointer"
                onClick={() => onFileNameClick(filePath)}>
                {getFileName(filePath)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs m-0 text-muted-foreground">{filePath}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-row items-center">
        <CopyToClipboard
          text={String(children)}
          onCopy={async () => {
            setCopyTip('Copied');
            setTimeout(() => setCopyTip('Copy code'), 5000);
          }}>
          {copyTip === 'Copied' ? (
            <div className="text-muted-foreground px-1 py-0.5 rounded-md hover:bg-muted">
              <CheckIcon className="size-3.5" />
            </div>
          ) : (
            <Button size="xs" variant="text" className="px-1 py-0.5 hover:bg-muted">
              <DocumentDuplicateIcon className="size-3.5" />
            </Button>
          )}
        </CopyToClipboard>

        {!isStreaming && onFastApplyClick && (
          <>
            {applyState === 'idle' && (
              <Button
                size="xs"
                variant="text"
                className="text-[11px] px-1 py-0 hover:bg-muted"
                onClick={handleApplyClick}>
                <PlayIcon className="size-3.5" />
                Apply
              </Button>
            )}

            {applyState === 'applying' && (
              <div className="text-muted-foreground px-1 py-0.5">
                <Spinner size="xs" />
              </div>
            )}

            {applyState === 'applied' && (
              <div className="flex items-center gap-1 ml-2">
                <Button
                  size="xs"
                  variant="text"
                  className="text-[11px] px-1 py-0 hover:bg-muted"
                  onClick={handleAcceptAll}>
                  ✅ Accept
                </Button>
                <Separator orientation="vertical" className="h-4" />
                <Button
                  size="xs"
                  variant="text"
                  className="text-[11px] px-1 py-0 hover:bg-muted"
                  onClick={handleRejectAll}>
                  ❌ Reject
                </Button>
              </div>
            )}
          </>
        )}
      </div>
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
  isStreaming: boolean;
  onFileNameClick?: (filePath: string) => void;
  onFastApplyClick?: (filePath: string, edits: string) => Promise<void>;
  onAcceptAllChanges?: (filePath: string) => void;
  onRejectAllChanges?: (filePath: string) => void;
}

export const CodeBlock = ({
  codeBlock,
  isStreaming,
  onFileNameClick,
  onFastApplyClick,
  onAcceptAllChanges,
  onRejectAllChanges,
  children
}: CodeBlockProps) => {
  return (
    <div className="rounded-md border border-border bg-background mt-1">
      {codeBlock?.filePath && (
        <FileHeader
          filePath={codeBlock.filePath}
          isStreaming={isStreaming}
          onFileNameClick={onFileNameClick}
          onFastApplyClick={onFastApplyClick}
          onAcceptAllChanges={onAcceptAllChanges}
          onRejectAllChanges={onRejectAllChanges}>
          {children}
        </FileHeader>
      )}
      <Editor extension={codeBlock?.extension} filePath={codeBlock?.filePath}>
        {children}
      </Editor>
    </div>
  );
};

interface MarkdownRenderProps extends React.PropsWithChildren {
  role: Role;
  isStreaming: boolean;
  onFileNameClick?: (filePath: string) => void;
  onFastApplyClick?: (filePath: string, edits: string) => Promise<void>;
  onAcceptAllChanges?: (filePath: string) => void;
  onRejectAllChanges?: (filePath: string) => void;
}

export const MarkdownRender = ({
  role,
  isStreaming,
  onFileNameClick,
  onFastApplyClick,
  onAcceptAllChanges,
  onRejectAllChanges,
  children
}: MarkdownRenderProps) => {
  const Code = useCallback(
    ({ inline, className, ...props }: any) => {
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

        return (
          <CodeBlock
            codeBlock={codeBlock}
            isStreaming={isStreaming}
            onFileNameClick={onFileNameClick}
            onFastApplyClick={onFastApplyClick}
            onAcceptAllChanges={onAcceptAllChanges}
            onRejectAllChanges={onRejectAllChanges}>
            {String(props.children).replace(/\n$/, '')}
          </CodeBlock>
        );
      }

      return <code className={cn('text-sm text-button-background', className)} {...props} />;
    },
    [onFileNameClick, onFastApplyClick]
  );

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
