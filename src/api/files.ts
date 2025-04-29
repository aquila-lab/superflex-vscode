import { checkRequestBodySize } from '../common/files'
import { Api } from './api'
import { parseError } from './error'
import type { RepoArgs } from './repo'

export type UploadFilesArgs = RepoArgs & {
  files: {
    relativePath: string
    source: string
  }[]
}

async function uploadFiles({
  owner,
  repo,
  files
}: UploadFilesArgs): Promise<void> {
  try {
    if (files.length === 0) {
      return Promise.resolve()
    }

    checkRequestBodySize({ files })
    await Api.post(`/repos/${owner}/${repo}/files`, {
      files: files.map(file => ({
        relative_path: file.relativePath,
        source: file.source
      }))
    })

    return Promise.resolve()
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export type RemoveFilesArgs = RepoArgs & {
  // Array of relative paths of files to remove
  files: string[]
}

async function removeFiles({ owner, repo, files }: RemoveFilesArgs) {
  try {
    if (files.length === 0) {
      return Promise.resolve()
    }

    await Api.delete(`/repos/${owner}/${repo}/files`, { data: { files } })
    return Promise.resolve()
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { uploadFiles, removeFiles }
