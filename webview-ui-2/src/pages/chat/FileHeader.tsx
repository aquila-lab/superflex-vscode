import { ReactNode, useState } from 'react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { CheckIcon, DocumentDuplicateIcon, PlayIcon } from '@heroicons/react/24/outline';

import { ApplyState, getFileName } from '../../common/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@radix-ui/react-tooltip';
import { Button } from '../../components/ui/Button';
import { Spinner } from '../../components/ui/Spinner';
import { FileIcon } from '../../components/ui/FileIcon';
import { Separator } from '../../components/ui/Separator';

export const FileHeader = ({ children }: { children: ReactNode }) => {
  const [copyTip, setCopyTip] = useState('Copy code');
  const [applyState, setApplyState] = useState<ApplyState>('idle');

  const filePath = '';

  return (
    <div className="flex items-center justify-between gap-4 px-1 rounded-t-md border-b border-border bg-sidebar h-6">
      <div className="flex items-center gap-1 min-w-0">
        <FileIcon filePath={filePath} className="size-4" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <p
                className="text-[11px] text-foreground truncate max-w-full overflow-hidden whitespace-nowrap text-overflow-ellipsis m-0 cursor-pointer"
                onClick={() => {}}>
                {getFileName(filePath)}
              </p>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs m-0 text-muted-foreground">{filePath}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="flex flex-row items-center">
        <CopyToClipboard text={String(children)} onCopy={() => {}}>
          {copyTip === 'Copied' ? (
            <div className="text-muted-foreground px-1 py-0.5 rounded-md hover:bg-muted">
              <CheckIcon className="size-3.5" />
            </div>
          ) : (
            <Button size="xs" variant="text" className="px-1 py-0.5 hover:bg-muted">
              <DocumentDuplicateIcon className="size-3.5" />
            </Button>
          )}
        </CopyToClipboard>

        {applyState === 'idle' && (
          <Button size="xs" variant="text" className="text-[11px] px-1 py-0 hover:bg-muted" onClick={() => {}}>
            <PlayIcon className="size-3.5" />
            Apply
          </Button>
        )}

        {applyState === 'applying' && (
          <div className="text-muted-foreground px-1 py-0.5">
            <Spinner size="xs" />
          </div>
        )}

        {applyState === 'applied' && (
          <div className="flex items-center gap-1 ml-2">
            <Button size="xs" variant="text" className="text-[11px] px-1 py-0 hover:bg-muted" onClick={() => {}}>
              ✅ Accept
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button size="xs" variant="text" className="text-[11px] px-1 py-0 hover:bg-muted" onClick={() => {}}>
              ❌ Reject
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
