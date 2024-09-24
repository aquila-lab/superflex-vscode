/**
 * @enum {string}
 */
export const ApiErrorTypes = {
  UNAUTHORIZED: "unauthorized",
  SESSION_LIMIT_EXCEEDED: "session_limit_exceeded",
  SESSION_EXPIRED: "session_expired",
};

export const IS_PROD = process.env.NODE_ENV === "production";
export const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://app.superflex.ai/";
export const API_BASE_URL = process.env.API_BASE_URL ?? "https://api.superflex.ai/v1";
export const FIGMA_OAUTH_CLIENT_ID = "ZnoCj0vPEwDoLR0jimrfMX";
export const FIGMA_OAUTH_CALLBACK_URL = `${API_BASE_URL}/auth/figma-callback`;

export const EXTENSION_ID = "aquilalabs.superflex";
export const BRAND_NAME = "superflex";

export const AUTH_PROVIDER_ID = `${BRAND_NAME}.auth`;
export const FIGMA_AUTH_PROVIDER_ID = `${AUTH_PROVIDER_ID}.figma`;

export const SUPERFLEX_POSTHOG_API_KEY = "phc_IHjFcEzOyL1UQAOwifm55y0YgMr1Zd5AQwx8RJC6jgq";

// file extensions that are supported by the extension
export const SUPPORTED_FILE_EXTENSIONS = [".htm", ".html", ".css", ".scss", ".js", ".ts", ".jsx", ".tsx", ".vue"];
