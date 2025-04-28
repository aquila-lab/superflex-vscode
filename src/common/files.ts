import fs from 'node:fs'
import path from 'node:path'

import type { FilePayload } from '../../shared/protocol'
import { MAX_FILE_SIZE, MAX_IMAGE_SIZE } from 'shared/common/constants'
import { ApiError } from 'src/api'
import { ApiErrorSlug } from 'src/api/error'

/**
 * Enriches file payloads with absolute paths and content from the workspace
 * @param files Array of file payloads to enrich
 * @param workspaceDirPath Base workspace directory path
 * @returns Enriched file payloads
 */
export function enrichFilePayloads(
  files: FilePayload[],
  workspaceDirPath: string
): FilePayload[] {
  if (!files || files.length === 0) {
    return files
  }

  return files.map((file: FilePayload) => {
    if (workspaceDirPath && file.relativePath) {
      const absolutePath = path.resolve(workspaceDirPath, file.relativePath)
      let content = undefined
      if (fs.existsSync(absolutePath)) {
        content = fs.readFileSync(absolutePath, 'utf8')
      }
      return { ...file, path: absolutePath, content }
    }
    return file
  })
}

/**
 * Calculate the size of a string in bytes
 */
function calculateStringSize(str: string): number {
  return new TextEncoder().encode(str).length
}

export function checkRequestBodySize(reqBody: Record<string, any>): void {
  if (!reqBody) {
    return
  }

  // Check files size
  if (reqBody.files && Array.isArray(reqBody.files)) {
    for (const file of reqBody.files) {
      if (!file.content && !file.source) {
        continue
      }
      const content = file.content || file.source
      const size = calculateStringSize(content)

      if (size > MAX_FILE_SIZE) {
        throw new ApiError(
          413,
          ApiErrorSlug.FileSizeLimitExceeded,
          'File size exceeds the limit'
        )
      }
    }
  }

  // Check image attachment size
  if (reqBody.attachment?.image || reqBody.image) {
    const base64Data = reqBody.attachment?.image || reqBody.image
    const size = Math.ceil((base64Data.length * 3) / 4) // Approximate size in bytes
    if (size > MAX_IMAGE_SIZE) {
      throw new ApiError(
        413,
        ApiErrorSlug.ImageSizeLimitExceeded,
        'Image size exceeds the limit'
      )
    }
  }
}
