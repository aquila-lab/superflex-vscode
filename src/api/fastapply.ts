import { Api } from './api'
import { parseError } from './error'

export type FastApplyArgs = {
  code: string
  edits: string
}

async function fastApply({ code, edits }: FastApplyArgs): Promise<string> {
  try {
    const { data } = await Api.post('/fast-apply', {
      code,
      edits
    })
    return Promise.resolve(JSON.parse(data.result))
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { fastApply }
