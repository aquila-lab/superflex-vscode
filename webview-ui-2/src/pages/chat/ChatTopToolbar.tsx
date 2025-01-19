import { FilePayload } from '../../../../shared/protocol';
import { FilePreview } from './FilePreview';
import FileSelectorPopover from './FileSelectorPopover';
import { FileTab } from './FileTab';

export const ChatTopToolbar = () => {
  const selectedFiles: FilePayload[] = [];

  const previewVisibleForFileID = null;

  return (
    <>
      {previewVisibleForFileID &&
        selectedFiles
          .filter((file) => file.id === previewVisibleForFileID)
          .map((file) => <FilePreview key={file.id} file={file} />)}

      <div className="flex flex-wrap gap-2 p-2 pb-0.5">
        <FileSelectorPopover selectedFiles={selectedFiles} />
        {selectedFiles.length === 0 ? (
          <p className="text-xs text-muted-foreground self-center">Add context</p>
        ) : (
          selectedFiles.map((file) => <FileTab key={file.id} file={file} />)
        )}
      </div>
    </>
  );
};
