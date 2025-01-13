import { IS_PROD, APP_BASE_URL, API_BASE_URL, SUPERFLEX_POSTHOG_API_KEY } from "../../shared/common/constants";
export { IS_PROD, APP_BASE_URL, API_BASE_URL, SUPERFLEX_POSTHOG_API_KEY };

/**
 * @enum {string}
 */
export const ApiErrorTypes = {
  UNAUTHORIZED: "unauthorized",
  SESSION_LIMIT_EXCEEDED: "session_limit_exceeded",
  SESSION_EXPIRED: "session_expired",
};

export const FIGMA_OAUTH_CLIENT_ID = "ZnoCj0vPEwDoLR0jimrfMX";
export const FIGMA_OAUTH_CALLBACK_URL = `${API_BASE_URL}/auth/figma-callback`;

export const EXTENSION_ID = "aquilalabs.superflex";
export const BRAND_NAME = "superflex";

export const AUTH_PROVIDER_ID = `${BRAND_NAME}.auth`;
export const FIGMA_AUTH_PROVIDER_ID = `${AUTH_PROVIDER_ID}.figma`;

export const FIGMA_PROVIDER_ID = `${BRAND_NAME}.figma`;

// file extensions that are supported by the extension
export const SUPPORTED_FILE_EXTENSIONS = [".htm", ".html", ".css", ".scss", ".js", ".ts", ".jsx", ".tsx", ".vue"];
