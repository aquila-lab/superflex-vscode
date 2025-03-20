import { v4 as uuidv4 } from 'uuid'

export const AppErrorSlug = {
  Unknown: "unknown",
  FileNotFoundOrUnauthorized: "file_not_found_or_unauthorized",
  TooManyAbsoluteFrames: "too_many_absolute_frames",
  NoFramesFound: "no_frames_found",
  UnsupportedSelection: "unsupported_selection",
} as const;

type AppErrorSlug = typeof AppErrorSlug[keyof typeof AppErrorSlug];

export class AppError extends Error {
  id: string;
  slug: AppErrorSlug;
  message: string;
  internalError: Error | null;
  data: any | null;

  constructor(
    message: string,
    slug: AppErrorSlug = AppErrorSlug.Unknown,
    internalError: Error | null = null,
    data: any | null = null,
  ) {
    super(message);
    this.id = uuidv4();
    this.message = message;
    this.slug = slug;
    this.internalError = internalError;
    this.data = data;
  }
}