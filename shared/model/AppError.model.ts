import { v4 as uuidv4 } from 'uuid'

export const AppErrorSlug = {
  Unknown: 'unknown',
  FileNotFoundOrUnauthorized: 'file_not_found_or_unauthorized',
  MissingFramesWithoutAutoLayout: 'missing_frames_without_auto_layout',
  NoFramesFound: 'no_frames_found',
  UnsupportedSelection: 'unsupported_selection',
  UrlNotSupportedInPrompt: 'url_not_supported_in_prompt',
  FigmaUrlNotSupportedInPrompt: 'figma_url_not_supported_in_prompt',
  ChatNotInitialized: 'chat_not_initialized',
  FigmaSelectionLinkRequired: 'figma_selection_link_required',
  InvalidFigmaSelectionLink: 'invalid_figma_selection_link',
  InvalidMessage: 'invalid_message',
  FigmaFreePlanNodeLimit: 'figma_free_plan_node_limit'
}

type AppErrorSlug = (typeof AppErrorSlug)[keyof typeof AppErrorSlug]

export class AppError extends Error {
  id: string
  slug: AppErrorSlug
  message: string
  internalError?: Error
  data?: any

  constructor(
    message: string,
    slug: AppErrorSlug = AppErrorSlug.Unknown,
    internalError?: Error,
    data?: any
  ) {
    super(message)
    this.id = uuidv4()
    this.message = message
    this.slug = slug
    this.internalError = internalError
    this.data = data
  }
}
