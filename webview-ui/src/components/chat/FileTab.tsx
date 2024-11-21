import React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';

import { FilePayload } from '../../../../shared/protocol';
import { cn } from '../../common/utils';
import { Button } from '../ui/Button';
import { FileIcon } from '../ui/FileIcon';

interface FileTabProps {
  file: FilePayload;
  previewVisibleForFileID: string | null;
  onTogglePreview: (file: FilePayload) => void;
  onRemoveFile: (file: FilePayload) => void;
}

export const FileTab: React.FC<FileTabProps> = ({ file, previewVisibleForFileID, onTogglePreview, onRemoveFile }) => {
  return (
    <div className="flex flex-col">
      <div
        className={cn(
          'flex items-center gap-1 bg-background rounded-md pl-0.5 pr-1.5 cursor-pointer',
          previewVisibleForFileID === file.id ? 'border border-accent' : 'border border-border'
        )}
        onClick={() => onTogglePreview(file)}>
        <div className="flex flex-row items-center gap-1">
          <FileIcon filename={file.name} className="size-5" />
          <p className="text-xs text-foreground truncate max-w-36">{file.name}</p>
          <p className="text-xs text-foreground">
            {file.startLine && file.endLine && ` (${file?.startLine}-${file?.endLine})`}
          </p>
          <p className="text-xs text-muted-secondary-foreground">
            {file.isCurrentOpenFile ? 'Current file' : file.endLine ? 'Code' : 'File'}
          </p>
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
    </div>
  );
};
