import {  FigmaService } from 'src/services/FigmaService'
import { type FigmaTokenInformation, type User } from '../../shared/model'
import { PublicApi } from './api'
import { parseError, parseFigmaApiError } from './error'
import { FigmaApi } from './figmaApi'
import { buildUserFromResponse } from './transformers'
import { FileNodesResponse } from "figma-js";
import { AppWarning } from 'shared/model/AppWarning.model'
import { AppError, AppErrorSlug } from 'shared/model/AppError.model'

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
      return Promise.reject(parseError(data.err));
    }

    return FigmaService.extractSelectionUrlFromResponse(data, nodeID);
  } catch (err) {
    const error = parseFigmaApiError(err);
            
    if (error.statusCode == 404) {
      throw new AppError(
        "File not found or you (%email%) don't have access to it.",
        AppErrorSlug.FileNotFoundOrUnauthorized,
        error
      );
    }

    return Promise.reject(error);
  }
}

async function validateFigmaSelection({
  fileID,
  nodeID
}: GetFigmaSelectionImageUrlArgs): Promise<AppWarning | undefined> {
  try {
    const { data } = await FigmaApi.get<FileNodesResponse>(`/files/${fileID}/nodes?ids=${nodeID}`)
    return FigmaService.validateFigmaSelection(data, nodeID);
  } catch (err) {
    return Promise.reject(parseFigmaApiError(err));
  }
}



export { figmaRefreshAccessToken, getFigmaUserInfo, getFigmaSelectionImageUrl, validateFigmaSelection }
