import { ReactNode, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { Role } from '../../../../shared/model';
import { MarkdownCodeProps } from '../../common/utils';
import { MarkdownCode } from './MarkdownCode';

export const MarkdownRender = ({
  role,
  isStreaming = false,
  children
}: {
  role: Role;
  isStreaming?: boolean;
  children: ReactNode;
}) => {
  const codeComponents = useMemo(
    () => ({
      code: (props: MarkdownCodeProps) => <MarkdownCode {...props} isStreaming={isStreaming} />
    }),
    [isStreaming]
  );

  return (
    <ReactMarkdown
      className={
        role !== Role.Assistant ? 'flex gap-2 flex-wrap' : 'prose prose-sm text-sm dark:prose-invert w-full max-w-none'
      }
      components={codeComponents}>
      {String(children)}
    </ReactMarkdown>
  );
};
