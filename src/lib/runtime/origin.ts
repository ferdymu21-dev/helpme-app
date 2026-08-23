import { headers } from "next/headers";

/**
 * Runtime Origin Resolver
 *
 * Priority:
 * 1. x-forwarded-host (Vercel / Tunnel / Proxy)
 * 2. host
 * 3. NEXT_PUBLIC_APP_URL
 */

export async function getRuntimeOrigin(): Promise<string> {
  const h = await headers();

  const forwardedHost = h.get("x-forwarded-host");
  const forwardedProto = h.get("x-forwarded-proto");

  if (forwardedHost) {
    return `${forwardedProto ?? "https"}://${forwardedHost}`;
  }

  const host = h.get("host");

  if (host) {
    const protocol =
      host.includes("localhost") || host.startsWith("127.0.0.1")
        ? "http"
        : "https";

    return `${protocol}://${host}`;
  }

  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}