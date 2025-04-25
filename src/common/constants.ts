import {
  API_BASE_URL,
  APP_BASE_URL,
  IS_PROD,
  SUPERFLEX_POSTHOG_API_KEY
} from '../../shared/common/constants'
export { IS_PROD, APP_BASE_URL, API_BASE_URL, SUPERFLEX_POSTHOG_API_KEY }

/**
 * @enum {string}
 */
export const ApiErrorTypes = {
  UNAUTHORIZED: 'unauthorized',
  SESSION_LIMIT_EXCEEDED: 'session_limit_exceeded',
  SESSION_EXPIRED: 'session_expired'
}

export const FIGMA_OAUTH_CLIENT_ID = 'ZnoCj0vPEwDoLR0jimrfMX'
export const FIGMA_OAUTH_CALLBACK_URL = `${API_BASE_URL}/auth/figma-callback`

export const EXTENSION_ID = 'aquilalabs.superflex'
export const BRAND_NAME = 'superflex'

export const AUTH_PROVIDER_ID = `${BRAND_NAME}.auth`
export const FIGMA_AUTH_PROVIDER_ID = `${AUTH_PROVIDER_ID}.figma`

export const FIGMA_PROVIDER_ID = `${BRAND_NAME}.figma`

// file extensions that are supported by the extension
export const SUPPORTED_FILE_EXTENSIONS = [
  '.htm',
  '.html',
  '.css',
  '.scss',
  '.js',
  '.ts',
  '.jsx',
  '.tsx',
  '.vue',
  '.svelte',
  '.md',
  '.markdown'
]

// project json files that are relevant for code generation
export const RELEVANT_JSON_FILES = [
  'theme.json',
  'tailwind.json',
  'menu.json',
  'forms.json',
  'components.json',
  'manifest.json',
  'package.json',
  'tsconfig.json',
  'eslint.json',
  'prettier.json',
  'biome.json',
  'vite.json'
]

// Binary and non-programming file types to ignore when scanning workspace
export const BINARY_FILE_EXTENSIONS = [
  // Images
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.svg',
  '**/*.webp',
  '**/*.ico',

  // Audio
  '**/*.mp3',
  '**/*.wav',
  '**/*.ogg',
  '**/*.flac',
  '**/*.m4a',

  // Video
  '**/*.mp4',
  '**/*.webm',
  '**/*.mov',
  '**/*.avi',
  '**/*.mkv',

  // Documents
  '**/*.pdf',
  '**/*.doc',
  '**/*.docx',
  '**/*.ppt',
  '**/*.pptx',
  '**/*.xls',
  '**/*.xlsx',

  // Archives
  '**/*.zip',
  '**/*.rar',
  '**/*.tar',
  '**/*.gz',
  '**/*.7z',

  // Binaries
  '**/*.exe',
  '**/*.dll',
  '**/*.so',
  '**/*.dylib',

  // Fonts
  '**/*.ttf',
  '**/*.otf',
  '**/*.woff',
  '**/*.woff2',
  '**/*.eot',

  // Database files
  '**/*.db',
  '**/*.sqlite',
  '**/*.db3',

  // ML models
  '**/*.model',
  '**/*.weights',
  '**/*.onnx',
  '**/*.pb',

  // Binary data
  '**/*.bin',
  '**/*.dat'
]
