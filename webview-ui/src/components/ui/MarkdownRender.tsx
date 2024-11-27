import React, { useState, useMemo, memo, useRef, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import CopyToClipboard from 'react-copy-to-clipboard';
import { DocumentCheckIcon, DocumentDuplicateIcon } from '@heroicons/react/24/outline';

import { Role } from '../../../../shared/model';
import { useAppSelector } from '../../core/store';
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
  codeBlock?: CodeBlockInfo;
  code: string;
}

export const CodeBlock = memo(({ codeBlock, code }: CodeBlockProps) => {
  return (
    <div className="rounded-md border border-border bg-background mt-1">
      {codeBlock?.filePath && <FileHeader filePath={codeBlock.filePath} content={code} />}
      <Editor extension={codeBlock?.extension} filePath={codeBlock?.filePath} content={code} />
    </div>
  );
});

CodeBlock.displayName = 'CodeBlock';

interface CodeBlockInfo {
  extension: string;
  filePath?: string;
  startLine?: number;
  endLine?: number;
}

export const extractCodeBlockDetails = (mdString: string): { codeBlocks: CodeBlockInfo[] } => {
  const codeBlocks: CodeBlockInfo[] = [];
  const lines = mdString.split('\n');

  lines.forEach((line) => {
    // \`\`\`file_extension file="file_path"
    const codeBlockMatch = line.match(/```(\w+)?(?:\s+(?:file="([^"]+)"))?/);

    if (codeBlockMatch) {
      const [, extension, filePath] = codeBlockMatch;
      if (extension) {
        codeBlocks.push({ extension, filePath });
      }
    }
  });

  return { codeBlocks };
};

interface MarkdownRenderProps {
  role: Role;
  mdString: string;
}

export const MarkdownRender: React.FunctionComponent<MarkdownRenderProps> = ({ role, mdString }) => {
  const cleanedMdString = useMemo(() => mdString.trimStart().trimEnd(), [mdString]);
  const { codeBlocks } = useMemo(() => extractCodeBlockDetails(cleanedMdString), [cleanedMdString]);

  // Use useRef to maintain the index between renders
  const codeBlockIndex = useRef(0);

  // Reset index when mdString changes
  useEffect(() => {
    codeBlockIndex.current = 0;
  }, [mdString]);

  const Code = useCallback(
    ({ inline, className, ...props }: any) => {
      const hasLang = /language-(\w+)/.exec(className || '');
      const codeProp = String(props.children).replace(/\n$/, '');

      if (!inline && hasLang) {
        // Only increment index when we actually use a code block
        const codeBlock = codeBlocks?.[codeBlockIndex.current++];
        return <CodeBlock codeBlock={codeBlock} code={codeProp} />;
      }

      return <code className={cn('text-sm text-button-background', className)} {...props} />;
    },
    [codeBlocks]
  );

  return (
    <ReactMarkdown
      className={
        role !== Role.Assistant ? 'flex gap-2 flex-wrap' : 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
      }
      components={{ code: Code }}>
      {cleanedMdString}
    </ReactMarkdown>
  );
};

export const StreamingMarkdownRender: React.FunctionComponent = () => {
  const streamTextDelta = useAppSelector((state) => state.chat.streamTextDelta);
  const cleanedMdString = useMemo(() => streamTextDelta.trimStart().trimEnd(), [streamTextDelta]);

  const { codeBlocks } = useMemo(() => extractCodeBlockDetails(cleanedMdString), [cleanedMdString]);

  // Use useRef to maintain the index between renders
  const codeBlockIndex = useRef(0);

  // Reset index when mdString changes
  useEffect(() => {
    codeBlockIndex.current = 0;
  }, [cleanedMdString]);

  const Code = useCallback(
    ({ inline, className, ...props }: any) => {
      const hasLang = /language-(\w+)/.exec(className || '');
      const codeProp = String(props.children).replace(/\n$/, '');

      if (!inline && hasLang) {
        // Only increment index when we actually use a code block
        const codeBlock = codeBlocks?.[codeBlockIndex.current++];
        return <CodeBlock codeBlock={codeBlock} code={codeProp} />;
      }

      return <code className={cn('text-sm text-button-background', className)} {...props} />;
    },
    [codeBlocks]
  );

  return (
    <ReactMarkdown className={'prose prose-sm text-sm dark:prose-invert w-full max-w-none'} components={{ code: Code }}>
      {cleanedMdString}
    </ReactMarkdown>
  );
};
