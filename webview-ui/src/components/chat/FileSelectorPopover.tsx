import React, { useEffect, useState } from 'react';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';

import { FilePayload } from '../../../../shared/protocol';
import { useAppSelector } from '../../core/store';
import { Button } from '../ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/Command';

interface FileSelectorPopoverProps {
  selectedFiles: FilePayload[];
  fetchFiles: () => void;
  onFileSelected: (file: FilePayload) => void;
}

const FileSelectorPopover: React.FC<FileSelectorPopoverProps> = ({ selectedFiles, fetchFiles, onFileSelected }) => {
  const [open, setOpen] = useState(false);
  const files = useAppSelector((state) => state.chat.files);

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchFiles();
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" role="combobox" aria-expanded={open}>
          <span className="sr-only">Select File</span>
          <PlusIcon className="text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 h-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search files..." className="h-6" />
          <CommandList>
            <CommandEmpty>No files found.</CommandEmpty>
            <CommandGroup>
              {files.map((file) => (
                <CommandItem
                  key={file.relativePath}
                  value={file.relativePath}
                  added={!!selectedFiles.find((f) => f.relativePath === file.relativePath)}
                  onSelect={() => {
                    onFileSelected(file);
                  }}>
                  <div className="flex items-baseline gap-2 w-full">
                    <span className="text-sm whitespace-nowrap">{file.name}</span>
                    <span className="text-left text-xs text-muted-foreground truncate flex-1">{file.relativePath}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>

          <div className="flex justify-between items-center gap-3 p-2 border-t border-border mt-auto">
            <div className="flex items-center gap-1 text-xs">
              <ArrowUpIcon className="size-4 p-1 rounded-md bg-muted" aria-hidden="true" />
              <ArrowDownIcon className="size-4 p-1 rounded-md bg-muted" aria-hidden="true" />
              <span className="text-muted-foreground">Navigate</span>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <div className="py-0.5 px-1 rounded-md bg-muted">Enter</div>
              <span className="text-muted-foreground">Toggle</span>
            </div>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FileSelectorPopover;
