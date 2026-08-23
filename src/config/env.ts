const isBrowser = typeof window !== "undefined";

export const APP_ENV =
  process.env.NODE_ENV ?? "development";

export const IS_DEV =
  APP_ENV === "development";

export const IS_PRODUCTION =
  APP_ENV === "production";

export const IS_VERCEL =
  Boolean(process.env.VERCEL);

export const IS_PREVIEW =
  process.env.VERCEL_ENV === "preview";

export const IS_PRODUCTION_DEPLOY =
  process.env.VERCEL_ENV === "production";

export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ??
  "http://localhost:3000";

/**
 * OPTIONAL HOSTS
 */

export const APP_TUNNEL_HOST =
  process.env.APP_TUNNEL_HOST ?? "";

export const APP_NGROK_HOST =
  process.env.APP_NGROK_HOST ?? "";

export const APP_CLOUDFLARE_HOST =
  process.env.APP_CLOUDFLARE_HOST ?? "";

export const APP_VERCEL_PREVIEW_HOST =
  process.env.APP_VERCEL_PREVIEW_HOST ?? "";

/**
 * URL aplikasi yang aman dipakai
 * baik di Client maupun Server.
 */
export function getAppUrl() {
  if (isBrowser) {
    return window.location.origin;
  }

  return APP_URL;
}

/**
 * Mengecek apakah request berasal
 * dari tunnel (VSCode/ngrok/Cloudflare).
 */
export function isTunnelHost(host: string) {
  return (
    host.includes("devtunnels.ms") ||
    host.includes("ngrok") ||
    host.includes("trycloudflare.com")
  );
}