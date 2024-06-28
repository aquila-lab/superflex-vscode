import path from "path";
import fg from "fast-glob";

import { decodeUriAndRemoveFilePrefix } from "../utils";

export async function findFiles(
  baseUri: string,
  globPatterns: string[],
  ignore: string[] = []
): Promise<string[]> {
  const relativePaths = await fg(globPatterns, {
    cwd: baseUri,
    ignore,
    followSymbolicLinks: false,
    suppressErrors: true,
    dot: true,
  });

  return relativePaths.map((rp) =>
    decodeUriAndRemoveFilePrefix(path.join(baseUri, rp))
  );
}
