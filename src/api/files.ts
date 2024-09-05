import { Api } from "./api";
import { RepoArgs } from "./repo";
import { parseError } from "./error";

export type UploadFilesArgs = RepoArgs & {
  files: {
    relativePath: string;
    source: string;
  }[];
};

async function uploadFiles({ owner, repo, files }: UploadFilesArgs): Promise<void> {
  try {
    await Api.post(`/repos/${owner}/${repo}/files`, {
      files: files.map((file) => ({
        relative_path: file.relativePath,
        source: file.source,
      })),
    });

    return Promise.resolve();
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export type RemoveFilesArgs = RepoArgs & {
  // Array of relative paths of files to remove
  files: string[];
};

async function removeFiles({ owner, repo, files }: RemoveFilesArgs) {
  try {
    await Api.delete(`/repos/${owner}/${repo}/files`, { data: { files } });
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(parseError(err));
  }
}

export { uploadFiles, removeFiles };
