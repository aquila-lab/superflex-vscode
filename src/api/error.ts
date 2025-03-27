import { AppError } from 'shared/model/AppError.model'
import { IS_PROD } from '../common/constants'

export class ApiError extends Error {
  statusCode: number
  slug: string
  message: string

  constructor(statusCode: number, slug: string, message: string) {
    super(message)
    this.message = message
    this.statusCode = statusCode
    this.slug = slug

    // This is needed in TypeScript when extending built-in classes
    Object.setPrototypeOf(this, ApiError.prototype)
  }
}

const internalServerError: ApiError = new ApiError(
  500,
  'internal_server',
  'Internal server error'
)

export function parseError(err: any): Error {
  if (!IS_PROD) {
    console.error(err)
  }

  if (err instanceof AppError) {
    return err
  }

  return parseApiError(err)
}

export function parseApiError(err: any): ApiError {
  if (_isFigmaApiError(err)) {
    return parseFigmaApiError(err)
  }

  if (!err?.response?.data?.error) {
    return internalServerError
  }
  return new ApiError(
    err.response.status,
    err.response.data.error.slug,
    err.response.data.error.message
  )
}

export function parseFigmaApiError(err: any): ApiError {
  if (!_isFigmaApiError(err)) {
    return parseApiError(err)
  }

  return new ApiError(
    err?.status,
    err?.response?.statusText?.toLowerCase().replace(' ', '_'),
    err?.message
  )
}

export function getCustomUserError(
  err: ApiError,
  defaultMsg = 'Internal server error'
): string {
  if (!!err?.slug.startsWith('custom_') || err?.slug === 'validation') {
    return err.message
  }
  return defaultMsg
}

function _isFigmaApiError(err: any): boolean {
  return err?.config?.baseURL === 'https://api.figma.com/v1'
}
