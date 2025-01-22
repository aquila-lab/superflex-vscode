import { useMemo } from 'react';
import { cn, MarkdownCodeProps } from '../../common/utils';
import { FileHeader } from './FileHeader';
import { Editor } from './Editor';

export const MarkdownCode = ({ inline, className, children }: MarkdownCodeProps) => {
  const match = useMemo(() => /language-(\w+)(?::([^#]+))?(?:#(\d+)-(\d+))?/.exec(className ?? ''), [className]);

  const codeBlock = useMemo(() => {
    if (!match || inline) return null;
    const [, extension, filePath, startLine, endLine] = match;
    return {
      extension,
      ...(filePath && { filePath: filePath.trim() }),
      ...(startLine && { startLine: parseInt(startLine, 10) }),
      ...(endLine && { endLine: parseInt(endLine, 10) })
    };
  }, [match, inline]);

  if (!codeBlock) {
    return <code className={cn('text-sm text-button-background', className)}>{children}</code>;
  }

  const draft = String(children).replace(/\n$/, '');

  return (
    <div className="rounded-md border border-border bg-background mt-1">
      <FileHeader>{draft}</FileHeader>
      <Editor extension={codeBlock.extension} filePath={codeBlock.filePath}>
        {draft}
      </Editor>
    </div>
  );
};
