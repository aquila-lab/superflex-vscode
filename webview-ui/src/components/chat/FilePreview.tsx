import React from 'react';
import hljs from 'highlight.js';
import 'highlight.js/styles/vs2015.css';
import Editor from 'react-simple-code-editor';
import { Cross2Icon } from '@radix-ui/react-icons';

import { Button } from '../ui/Button';
import { FileIcon } from '../ui/FileIcon';
import { FilePayload } from '../../../../shared/protocol';
import { SyntaxHighlightedPre } from '../ui/MarkdownRender';

interface FilePreviewProps {
  file: FilePayload;
  previewVisibleForFile: string | null;
  onTogglePreview: (file: FilePayload) => void;
  onRemoveFile: (file: FilePayload) => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  previewVisibleForFile,
  onTogglePreview,
  onRemoveFile
}) => {
  return (
    <div className="flex flex-col">
      <div
        className="flex items-center gap-1 bg-background border border-border rounded-md pl-0.5 pr-1.5 cursor-pointer"
        onClick={() => onTogglePreview(file)}>
        <div className="flex flex-row items-center gap-1">
          <FileIcon filename={file.name} className="size-5" />
          <p className="text-xs text-muted-foreground truncate max-w-36">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.startLine && file.endLine && ` (${file?.startLine}-${file?.endLine})`}
          </p>
          <p className="text-xs text-muted-secondary-foreground">{file.isCurrentOpenFile ? 'Current file' : 'File'}</p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            size="xs"
            variant="text"
            className="p-0"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveFile(file);
            }}
            aria-label={`remove-${file.name}`}>
            <Cross2Icon className="size-3.5" />
          </Button>
        </div>
      </div>

      {previewVisibleForFile === file.id && (
        <div className="rounded-md mt-4 mx-2 border border-border bg-background">
          <div className="flex gap-1 pt-1 px-2 border-b border-border">
            <FileIcon filename={file.name} className="size-5" />
            <p className="text-xs text-foreground truncate max-w-36">{file.name}</p>
            <p className="text-xs text-foreground truncate max-w-36">{`(${file?.startLine}-${file?.endLine})`}</p>
          </div>

          <Editor
            value={file?.content ?? ''}
            onValueChange={() => {}} // Not editable
            highlight={(code) => (
              <SyntaxHighlightedPre>
                <div dangerouslySetInnerHTML={{ __html: hljs.highlightAuto(code).value }} />
              </SyntaxHighlightedPre>
            )}
            padding={10}
            style={{
              fontFamily: '"Fira code", "Fira Mono", monospace',
              fontSize: 12
            }}
          />
        </div>
      )}
    </div>
  );
};
