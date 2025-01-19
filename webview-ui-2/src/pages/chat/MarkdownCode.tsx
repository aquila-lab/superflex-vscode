import { useMemo } from 'react';
import { cn, MarkdownCodeProps } from '../../common/utils';
import { CodeBlock } from './CodeBlock';

export const MarkdownCode = ({ inline, className, children, isStreaming }: MarkdownCodeProps) => {
  const match = /language-(\w+)(?::([^#]+))?(?:#(\d+)-(\d+))?/.exec(className ?? '');

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

  return (
    <CodeBlock codeBlock={codeBlock} isStreaming={Boolean(isStreaming)}>
      {String(children).replace(/\n$/, '')}
    </CodeBlock>
  );
};
