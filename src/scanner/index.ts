import fs from 'node:fs'
import path from 'node:path'
import fg from 'fast-glob'

import {
  SUPPORTED_FILE_EXTENSIONS,
  RELEVANT_JSON_FILES
} from '../common/constants'
import { decodeUriAndRemoveFilePrefix } from '../common/utils'

/**
 * Finds files based on the given glob patterns and returns their paths.
 *
 * @param {string} baseUri - The base URI to search for files.
 * @param {string[]} globPatterns - The glob patterns to match files against.
 * @param {string[]} [ignore=[]] - An optional array of glob patterns to ignore.
 * @return {Promise<string[]>} An array of file paths that match the glob patterns.
 */
export async function findFiles(
  baseUri: string,
  globPatterns: string[],
  ignore: string[] = []
): Promise<string[]> {
  const negatedPatterns = ignore.filter(pattern => pattern.startsWith('!'))
  const regularIgnores = ignore.filter(pattern => !pattern.startsWith('!'))

  const regularFiles = await fg(globPatterns, {
    cwd: baseUri,
    ignore: regularIgnores,
    followSymbolicLinks: false,
    suppressErrors: true,
    dot: true
  })

  let explicitlyIncludedFiles: string[] = []
  if (negatedPatterns.length > 0) {
    const includePatterns = negatedPatterns.map(pattern => pattern.substring(1))

    const processedIncludePatterns = includePatterns.flatMap(pattern => {
      // If the pattern doesn't have a file extension and doesn't end with /**,
      // it might be a directory, so add a /** to capture all files within it
      if (!pattern.includes('.') && !pattern.endsWith('/**')) {
        if (pattern.endsWith('/')) {
          return [`${pattern}**`]
        }
        return [pattern, `${pattern}/**`]
      }
      return [pattern]
    })

    explicitlyIncludedFiles = await fg(processedIncludePatterns, {
      cwd: baseUri,
      followSymbolicLinks: false,
      suppressErrors: true,
      dot: true
    })
  }

  // Merge both sets of files and remove duplicates
  const allFiles = [...new Set([...regularFiles, ...explicitlyIncludedFiles])]

  // Return formatted paths
  return allFiles.map(rp =>
    decodeUriAndRemoveFilePrefix(path.join(baseUri, rp))
  )
}

function readIgnoreFile(filePath: string): string[] {
  try {
    if (!fs.existsSync(filePath)) {
      return []
    }

    const content = fs.readFileSync(filePath, 'utf8')
    return content
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#'))
  } catch {
    return []
  }
}

/**
 * Finds all project files in the given workspace directory.
 *
 * @param {string} workspaceDirPath - The path to the workspace directory.
 * @return {Promise<string[]>} An array of file paths for the project files found.
 */
export async function findWorkspaceFiles(
  workspaceDirPath: string,
  globPatterns?: string[],
  ignore?: string[]
): Promise<string[]> {
  if (!globPatterns) {
    globPatterns = [
      ...SUPPORTED_FILE_EXTENSIONS.map(ext => `**/*${ext}`),
      ...RELEVANT_JSON_FILES.map(file => `**/${file}`)
    ]
  }

  // Default ignore patterns
  const defaultIgnore = [
    '**/.env',
    '**/.DS_Store',
    '**/node_modules/**',
    '**/build/**',
    '**/out/**',
    '**/dist/**',
    '**/.next/**',
    '**/.git/**',
    '**/.cache/**',
    '**/__tests__/**',
    '**/__mocks__/**'
  ]

  // Read .gitignore and .superflexignore
  const gitignorePatterns = readIgnoreFile(
    path.join(workspaceDirPath, '.gitignore')
  )
  const superflexignorePatterns = readIgnoreFile(
    path.join(workspaceDirPath, '.superflexignore')
  )

  // Combine all ignore patterns
  const combinedIgnore = [
    ...(ignore || []),
    ...defaultIgnore,
    ...gitignorePatterns,
    ...superflexignorePatterns
  ]

  return findFiles(workspaceDirPath, globPatterns, combinedIgnore)
}
