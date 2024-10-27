export const IS_PROD = (process.env.NODE_ENV ?? "production") === "production";
export const APP_BASE_URL = process.env.APP_BASE_URL ?? "https://app.superflex.ai";
export const API_BASE_URL = process.env.API_BASE_URL ?? "https://api.superflex.ai/v1";
export const STRIPE_CUSTOMER_PORTAL_URL =
  process.env.STRIPE_CUSTOMER_PORTAL_URL ?? "https://billing.stripe.com/p/login/3cs3dQdenfJucIU144";
export const SUPERFLEX_POSTHOG_API_KEY = "phc_IHjFcEzOyL1UQAOwifm55y0YgMr1Zd5AQwx8RJC6jgq";
