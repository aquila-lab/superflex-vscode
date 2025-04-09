import { FIGMA_SELECTION_URL_REGEX, URL_REGEX } from 'shared/common/constants'
import type { MessageContent } from 'shared/model'
import { AppError, AppErrorSlug } from 'shared/model/AppError.model'

// Helper function to create the name of the files map
export function createFilesMapName(provider: string, version: number): string {
  return `${provider}-files-map-v${version}.json`.toLocaleLowerCase()
}

// Validates user's prompt before sending it to the backend
export function validateInputMessage(messageContent: MessageContent): void {
  if (!messageContent.text && !messageContent.attachment) {
    throw new AppError(
      'Message must contain either text or attachment.',
      AppErrorSlug.InvalidMessage
    )
  }

  if (!messageContent.text) {
    return
  }

  if (containsFigmaSelectionURL(messageContent.text)) {
    throw new AppError(
      'Figma selection URLs are not supported within the text input, please use designated modal for that.',
      AppErrorSlug.FigmaUrlNotSupportedInPrompt
    )
  }

  if (containsURL(messageContent.text)) {
    throw new AppError(
      'URLs are not yet supported within the text input, please update your message and try again.',
      AppErrorSlug.UrlNotSupportedInPrompt
    )
  }

  return
}

function containsFigmaSelectionURL(inputString: string): boolean {
  return FIGMA_SELECTION_URL_REGEX.test(inputString)
}

function containsURL(inputString: string): boolean {
  return URL_REGEX.test(inputString)
}
