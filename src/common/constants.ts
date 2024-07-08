/**
 * @enum {string}
 */
export const ApiErrorTypes = {
  UNAUTHORIZED: "unauthorized",
  SESSION_LIMIT_EXCEEDED: "session_limit_exceeded",
  SESSION_EXPIRED: "session_expired",
};

export const IS_PROD = process.env.NODE_ENV === "production";
export const APP_BASE_URL = process.env.APP_BASE_URL ?? "http://localhost:3000/";
export const API_BASE_URL = process.env.API_BASE_URL ?? "http://localhost:8000/api/v1";

export const BRAND_NAME = "elementai";

// file extensions that are supported by the extension
export const SUPPORTED_FILE_EXTENSIONS = [
  ".html",
  ".htm",
  ".css",
  ".scss",
  ".jsx",
  ".tsx",
  ".vue",
  ".svelte",
  ".sass",
  ".less",
  ".styl",
];
