import type { FigmaTokenInformation, User } from '../../shared/model'
import { PublicApi } from './api'
import { parseError } from './error'
import { FigmaApi } from './figmaApi'
import { buildUserFromResponse } from './transformers'

type FigmaRefreshAccessTokenArgs = {
  refreshToken: string
}

async function figmaRefreshAccessToken({
  refreshToken
}: FigmaRefreshAccessTokenArgs): Promise<FigmaTokenInformation> {
  try {
    const res = await PublicApi.post('/auth/figma-refresh-token', {
      refresh_token: refreshToken
    })

    return Promise.resolve({
      accessToken: res.data.access_token,
      refreshToken: res.data.refresh_token
    })
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

async function getFigmaUserInfo(): Promise<User> {
  try {
    const { data } = await FigmaApi.get('/me')
    return Promise.resolve(buildUserFromResponse(data))
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

type GetFigmaSelectionImageUrlArgs = {
  fileID: string
  nodeID: string
}

async function getFigmaSelectionImageUrl({
  fileID,
  nodeID
}: GetFigmaSelectionImageUrlArgs): Promise<string> {
  try {
    const { data } = await FigmaApi.get(`/images/${fileID}?ids=${nodeID}`)
    if (data.err) {
      return Promise.reject(parseError(data.err))
    }

    return Promise.resolve(
      data.images[nodeID.replace('-', ':')] ?? data.images[nodeID]
    )
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export { figmaRefreshAccessToken, getFigmaUserInfo, getFigmaSelectionImageUrl }
