import React, { useState } from 'react';
import { PlusIcon } from '@radix-ui/react-icons';

import { Button } from '../ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../ui/Command';

interface FileSelectorPopoverProps {
  onFileSelected: (file: { name: string; path: string }) => void;
}

const FileSelectorPopover: React.FC<FileSelectorPopoverProps> = ({ onFileSelected }) => {
  const files = [
    { name: 'AppPages.tsx', path: 'src/pages/AppPages.tsx' },
    { name: 'LoginPage.tsx', path: 'public/LoginPage.tsx' },
    { name: 'PrivacyPolicyPage.tsx', path: 'src/pages/PrivacyPolicyPage.tsx' },
    { name: 'ResetPasswordPage.tsx', path: 'src/pages/ResetPasswordPage.tsx' },
    { name: 'ForgotPasswordPage.tsx', path: 'src/pages/ForgotPasswordPage.tsx' },
    { name: 'FigmaSuccessfulPage.tsx', path: 'src/pages/FigmaSuccessfulPage.tsx' },
    { name: 'index.ts', path: 'src/pages/public/index.ts' },
    { name: 'firebase-hosting-merge.yml', path: 'firebase-hosting-merge.yml' },
    { name: 'firebase-hosting-pull-request.yml', path: 'firebase-hosting-pull-request.yml' }
  ];
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" role="combobox" aria-expanded={open}>
          <span className="sr-only">Select File</span>
          <PlusIcon aria-hidden="true" />
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
                  key={file.path}
                  value={file.name}
                  onSelect={() => {
                    onFileSelected(file);
                    setOpen(false);
                  }}>
                  <div className="flex items-baseline gap-2 w-full">
                    <span>{file.name}</span>
                    <span className="text-xs text-muted-foreground truncate flex-1">{file.path}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default FileSelectorPopover;
