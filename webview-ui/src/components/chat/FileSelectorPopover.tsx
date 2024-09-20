import React, { useState } from 'react';
import { PlusIcon } from '@radix-ui/react-icons';

import { Button } from '../ui/Button';
import { TabContainer, TabRoot } from '../ui/Tabs';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/Popover';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '../ui/Command';

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
        <Button variant="outline" size="icon">
          <span className="sr-only">Select File</span>
          <PlusIcon aria-hidden="true" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <TabRoot>
          <TabContainer value="file-selector">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">AppPages.tsx Current File</span>
            </div>
          </TabContainer>
        </TabRoot>

        <div className="mt-4">
          <Command>
            <CommandInput placeholder="Search files..." className="h-10" />
            <CommandList>
              {files.length > 0 ? (
                files.map((file) => (
                  <CommandItem
                    key={file.name}
                    onSelect={() => {
                      onFileSelected(file);
                      setOpen(false);
                    }}
                    className="flex justify-between p-2 hover:bg-gray-100">
                    <span className="font-bold">{file.name}</span>
                    <span className="text-gray-500">{file.path}</span>
                  </CommandItem>
                ))
              ) : (
                <CommandEmpty>No files found.</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default FileSelectorPopover;
