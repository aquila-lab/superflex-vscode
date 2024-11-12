import React from 'react';
import { Cross2Icon } from '@radix-ui/react-icons';

import { Button } from '../ui/Button';
import { FileIcon } from '../ui/FileIcon';
import { FilePayload } from '../../../../shared/protocol';

interface FileListItemProps {
  file: FilePayload;
  onShowSelectedCode: (fileName: string) => void;
  onRemoveFile: (file: FilePayload) => void;
}

export const FileListItem: React.FC<FileListItemProps> = ({ file, onShowSelectedCode, onRemoveFile }) => {
  return (
    <div className="flex items-center gap-1 bg-background border border-border rounded-md pl-0.5 pr-1.5">
      <div
        className="flex flex-row items-center gap-1 hover:cursor-pointer"
        onClick={() => onShowSelectedCode(file.name)}>
        <FileIcon filename={file.name} className="size-5" />
        <p className="text-xs text-muted-foreground truncate max-w-36">{file.name}</p>
        <p className="text-xs text-muted-secondary-foreground">{file.isCurrentOpenFile ? 'Current file' : 'File'}</p>
      </div>
      <Button
        size="xs"
        variant="text"
        className="p-0"
        onClick={() => onRemoveFile(file)}
        aria-label={`remove-${file.name}`}>
        <Cross2Icon className="size-3.5" />
      </Button>
    </div>
  );
};
