import fs from 'node:fs'
import path from 'node:path'

import type { FilePayload } from '../../shared/protocol'

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
