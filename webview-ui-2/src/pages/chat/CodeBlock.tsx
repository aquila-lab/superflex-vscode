import { ReactNode } from 'react';
import { CodeBlockInfo } from '../../common/utils';
import { Editor } from './Editor';
import { FileHeader } from './FileHeader';

export const CodeBlock = ({
  codeBlock,
  isStreaming,
  children
}: {
  codeBlock?: CodeBlockInfo;
  isStreaming: boolean;
  children: ReactNode;
}) => {
  return (
    <div className="rounded-md border border-border bg-background mt-1">
      {codeBlock?.filePath && (
        <FileHeader
          filePath={codeBlock.filePath}
          isStreaming={isStreaming}>
          {children}
        </FileHeader>
      )}
      <Editor extension={codeBlock?.extension} filePath={codeBlock?.filePath}>
        {children}
      </Editor>
    </div>
  );
};
