export const IS_PROD = (process.env.NODE_ENV ?? 'production') === 'production'
export const APP_BASE_URL =
  process.env.APP_BASE_URL ?? 'https://app.superflex.ai'
export const API_BASE_URL =
  process.env.API_BASE_URL ?? 'https://api.superflex.ai/v1'
export const SUPERFLEX_POSTHOG_API_KEY =
  'phc_IHjFcEzOyL1UQAOwifm55y0YgMr1Zd5AQwx8RJC6jgq'

export const SUPERFLEX_RULES_FILE_NAME = '.superflexrules'

export const URL_REGEX = /https?:\/\/[a-zA-Z0-9._-]+\.[a-zA-Z]{2,}(\S*)?/
export const FIGMA_SELECTION_URL_REGEX =
  /https:\/\/www\.figma\.com\/(file|design)\/[a-zA-Z0-9]+\/[^?]+\?node-id=[^&]+/

export const MAX_FREE_NODES = 100

export const MAX_FILE_SIZE = 0.2 * 1024 * 1024 // 200KB
export const MAX_IMAGE_SIZE = 3 * 1024 * 1024 // 3MB
export const MAX_FILE_LENGTH_IN_TOKENS_TO_UPLOAD = 100000
