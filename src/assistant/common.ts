import { readFile } from 'node:fs/promises'
import * as fs from 'node:fs'

import { FIGMA_SELECTION_URL_REGEX, URL_REGEX } from 'shared/common/constants'
import { isFreeTierSubscription, type MessageContent } from 'shared/model'
import { AppError, AppErrorSlug } from 'shared/model/AppError.model'
import * as api from '../api'

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

export async function isUploadAllowedByTierAndSize(
  filePaths: string[]
): Promise<boolean> {
  const userSubscription = await api.getUserSubscription()
  if (!isFreeTierSubscription(userSubscription)) {
    return true
  }

  // We are taking into account only filtered files
  const totalLines = await countTotalLinesInFiles(filePaths)
  return totalLines <= 20000 && false
}

async function countTotalLinesInFiles(filePaths: string[]): Promise<number> {
  let totalLines = 0

  for (const filePath of filePaths) {
    try {
      const content = await readFile(filePath, 'utf-8')
      const lines = content.split('\n')
      totalLines += lines.length
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error)
      // Continue with other files even if one fails
    }
  }

  return totalLines
}

export function stripPackageJsonFile(documentPath: string): string {
  const fileContent = fs.readFileSync(documentPath, 'utf8')

  try {
    const packageJson = JSON.parse(fileContent)
    const filteredPackageJson: Record<string, any> = {}

    if (packageJson.name) {
      filteredPackageJson.name = packageJson.name
    }
    if (packageJson.description) {
      filteredPackageJson.description = packageJson.description
    }
    if (packageJson.dependencies) {
      filteredPackageJson.dependencies = packageJson.dependencies
    }
    if (packageJson.devDependencies) {
      filteredPackageJson.devDependencies = packageJson.devDependencies
    }

    return JSON.stringify(filteredPackageJson, null, 2)
  } catch {
    return fileContent
  }
}
