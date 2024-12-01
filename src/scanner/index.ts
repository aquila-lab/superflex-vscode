import fs from "fs";
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

function readIgnoreFile(filePath: string): string[] {
  try {
    if (!fs.existsSync(filePath)) {
      return [];
    }

    const content = fs.readFileSync(filePath, "utf-8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch {
    return [];
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
    globPatterns = SUPPORTED_FILE_EXTENSIONS.map((ext) => `**/*${ext}`);
  }

  // Default ignore patterns
  const defaultIgnore = [
    "**/node_modules/**",
    "**/build/**",
    "**/out/**",
    "**/dist/**",
    "**/.next/**",
    "**/.git/**",
    "**/coverage/**",
    "**/test/**",
    "**/public/**",
    "**/.cache/**",
    "**/storybook-static/**",
    "**/.storybook/**",
    "**/cypress/**",
    "**/__tests__/**",
    "**/__mocks__/**",
    "**/e2e/**",
    "**/.docz/**",
    "**/static/**",
    "**/.DS_Store/**",
    ".env",
  ];

  // Read .gitignore and .superflexignore
  const gitignorePatterns = readIgnoreFile(path.join(workspaceDirPath, ".gitignore"));
  const superflexignorePatterns = readIgnoreFile(path.join(workspaceDirPath, ".superflexignore"));

  // Combine all ignore patterns
  const combinedIgnore = [...(ignore || []), ...defaultIgnore, ...gitignorePatterns, ...superflexignorePatterns];

  return findFiles(workspaceDirPath, globPatterns, combinedIgnore);
}
