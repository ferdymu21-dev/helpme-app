import type { NextConfig } from "next";

import { getAllowedOrigins } from "./src/config/app";

const supabaseHostname = new URL(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
).hostname;

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: supabaseHostname,
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",

      /**
       * Trusted Origins
       *
       * Digunakan oleh Next.js untuk memvalidasi
       * request Server Actions yang datang
       * melalui:
       *
       * - localhost
       * - VS Code Tunnel
       * - ngrok
       * - Cloudflare Tunnel
       * - Vercel Preview
       */
      allowedOrigins: getAllowedOrigins(),
    },
  },
};

export default nextConfig;