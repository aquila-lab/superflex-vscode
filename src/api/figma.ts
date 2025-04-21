import type { FileNodesResponse, Node } from 'figma-js'
import { AppErrorSlug } from 'shared/model/AppError.model'
import type { AppWarning } from 'shared/model/AppWarning.model'
import { FigmaService } from 'src/services/FigmaService'
import type { FigmaTokenInformation, User } from '../../shared/model'
import { PublicApi } from './api'
import { ApiError, parseError } from './error'
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

type GetFigmaSelectionUrlArgs = {
  fileID: string
  nodeID: string
}

async function getFigmaSelectionImageUrl({
  fileID,
  nodeID
}: GetFigmaSelectionUrlArgs): Promise<string> {
  try {
    const { data } = await FigmaApi.get(`/images/${fileID}?ids=${nodeID}`)
    if (data.err) {
      return Promise.reject(parseError(data.err))
    }

    return FigmaService.extractSelectionUrlFromResponse(data, nodeID)
  } catch (err) {
    const error = parseError(err)

    if (error instanceof ApiError && error.statusCode === 404) {
      throw new ApiError(
        404,
        AppErrorSlug.FileNotFoundOrUnauthorized,
        "File not found or you (%email%) don't have access to it."
      )
    }

    return Promise.reject(error)
  }
}

async function getFigmaSelectionDocument({
  fileID,
  nodeID
}: GetFigmaSelectionUrlArgs): Promise<Node | undefined> {
  try {
    const { data } = await FigmaApi.get<FileNodesResponse>(
      `/files/${fileID}/nodes?ids=${nodeID}`
    )
    return data.nodes[nodeID.replace('-', ':')]?.document
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

type ValidateFigmaSelectionArgs = {
  document: Node | undefined
  isFreePlan?: boolean
}

async function validateFigmaSelection({
  document,
  isFreePlan
}: ValidateFigmaSelectionArgs): Promise<AppWarning | undefined> {
  try {
    return FigmaService.validateFigmaSelection(document, isFreePlan)
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

async function getFigmaSelectionColorPalette(
  document: Node | undefined
): Promise<string[]> {
  try {
    return FigmaService.getFigmaSelectionColorPalette(document)
  } catch (err) {
    return Promise.reject(parseError(err))
  }
}

export {
  figmaRefreshAccessToken,
  getFigmaUserInfo,
  getFigmaSelectionImageUrl,
  getFigmaSelectionDocument as getFigmaSelectionData,
  validateFigmaSelection,
  getFigmaSelectionColorPalette
}
