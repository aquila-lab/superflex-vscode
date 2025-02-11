import { Api } from './api'
import { parseError } from './error'

export type RepoArgs = {
  owner: string
  repo: string
}

export async function repoExists({ owner, repo }: RepoArgs): Promise<boolean> {
  try {
    const { data } = await Api.get(`/repos/${owner}/${repo}/exists`)
    return Promise.resolve(data.exists)
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}
