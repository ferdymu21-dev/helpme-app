import {
  getAppUrl,
  APP_TUNNEL_HOST,
  APP_NGROK_HOST,
  APP_CLOUDFLARE_HOST,
  APP_VERCEL_PREVIEW_HOST,
} from "./env";

export const AppConfig = {
  name: "HelpMe",

  appUrl: getAppUrl(),
};

/**
 * Host yang diizinkan oleh Next Server Actions.
 *
 * Seluruh host dikumpulkan di sini sehingga
 * next.config.ts cukup memanggil satu fungsi.
 */
export function getAllowedOrigins(): string[] {
  const origins = new Set<string>();

  /**
   * Primary App URL
   */
  if (AppConfig.appUrl) {
    origins.add(new URL(AppConfig.appUrl).host);
  }

  /**
   * Local Development
   */
  origins.add("localhost:3000");
  origins.add("127.0.0.1:3000");

  /**
   * Optional Deployment Hosts
   */
  [
    APP_TUNNEL_HOST,
    APP_NGROK_HOST,
    APP_CLOUDFLARE_HOST,
    APP_VERCEL_PREVIEW_HOST,
  ]
    .filter(Boolean)
    .forEach((host) => origins.add(host.toLowerCase()));

  return [...origins];
}

/**
 * Validasi host
 */
export function isAllowedHost(host: string): boolean {
  return getAllowedOrigins().includes(
    host.toLowerCase(),
  );
}