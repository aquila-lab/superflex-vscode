export type DiffLineType = "new" | "old" | "same";

export interface DiffLine {
  type: DiffLineType;
  line: string;
}

export type ApplyStateStatus =
  | "streaming" // Changes are being applied to the file
  | "done" // All changes have been applied, awaiting user to accept/reject
  | "closed"; // All changes have been applied. Note that for new files, we immediately set the status to "closed"

export interface ApplyState {
  streamId: string;
  status?: ApplyStateStatus;
  numDiffs?: number;
  filepath?: string;
  fileContent?: string;
}
