import path from "path";
import fg from "fast-glob";

import { decodeUriAndRemoveFilePrefix } from "../common/utils";
import { SUPPORTED_FILE_EXTENSIONS } from "../common/constants";

/**
 * Finds files based on the given glob patterns and returns their paths.
 *
 * @param {string} baseUri - The base URI to search for files.
 * @param {string[]} globPatterns - The glob patterns to match files against.
 * @param {string[]} [ignore=[]] - An optional array of glob patterns to ignore.
 * @return {Promise<string[]>} An array of file paths that match the glob patterns.
 */
export async function findFiles(baseUri: string, globPatterns: string[], ignore: string[] = []): Promise<string[]> {
  const relativePaths = await fg(globPatterns, {
    cwd: baseUri,
    ignore,
    followSymbolicLinks: false,
    suppressErrors: true,
    dot: true,
  });

  return relativePaths.map((rp) => decodeUriAndRemoveFilePrefix(path.join(baseUri, rp)));
}

/**
 * Finds all project files in the given workspace directory.
 *
 * @param {string} workspaceDirPath - The path to the workspace directory.
 * @return {Promise<string[]>} An array of file paths for the project files found.
 */
export async function findWorkspaceFiles(workspaceDirPath: string): Promise<string[]> {
  const documentsUri: string[] = await findFiles(
    workspaceDirPath,
    SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`),
    ["**/node_modules/**", "**/build/**", "**/out/**", "**/dist/**"]
  );

  return documentsUri;
}
