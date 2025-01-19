import { useCallback, useEffect, useState } from 'react';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon } from '@radix-ui/react-icons';
import { FilePayload } from '../../../../shared/protocol';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '../../components/ui/Command';
import { Button } from '../../components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../../components/ui/Popover';
import { FileIcon } from '../../components/ui/FileIcon';

const FileSelectorPopover = ({ selectedFiles }: { selectedFiles: FilePayload[] }) => {
  const [open, setOpen] = useState(false);
  const files: FilePayload[] = [];

  const fetchFiles = useCallback(() => {}, []);

  const handleFileSelected = useCallback((file: FilePayload) => {}, []);

  useEffect(() => {
    if (!open) {
      return;
    }

    fetchFiles();
  }, [open]);

  const customFilter = (value: string, search: string): number => {
    const searchTerms = search
      .toLowerCase()
      .split(/\s+/)
      .filter((term) => term.length > 0);
    const valueLower = value.toLowerCase();

    // Check if all search terms are included in the value
    const matches = searchTerms.every((term) => valueLower.includes(term));

    // Return 1 if all terms match, otherwise 0
    return matches ? 1 : 0;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" role="combobox" aria-expanded={open}>
          <span className="sr-only">Select Files</span>
          <PlusIcon className="text-muted-foreground" aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-60 h-[300px] p-0">
        <Command filter={customFilter}>
          <CommandInput placeholder="Search files..." className="h-6" />
          <CommandList>
            <CommandEmpty>No files found.</CommandEmpty>
            <CommandGroup>
              {files.map((file) => (
                <CommandItem
                  key={file.id}
                  value={file.relativePath}
                  added={!!selectedFiles.find((f) => f.id === file.id)}
                  onSelect={() => {
                    handleFileSelected(file);
                  }}>
                  <div className="flex items-center gap-2 w-full">
                    <FileIcon filePath={file.relativePath} className="size-5" />
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
