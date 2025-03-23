import { IS_PROD } from '../common/constants'

export class ApiError extends Error {
  statusCode: number
  slug: string

  constructor(statusCode: number, slug: string, message: string) {
    super(message)
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

export function parseError(err: any): ApiError {
  if (!IS_PROD) {
    console.error(err)
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
  if (err?.config?.baseURL !== "https://api.figma.com/v1") {
    return parseError(err);
  }

  return new ApiError(
    err?.status,
    err?.response?.statusText?.toLowerCase().replace(' ', '_'),
    err?.message,
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
