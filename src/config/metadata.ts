// src/config/metadata.ts

import type { Metadata } from "next";

import { AppConfig } from "./app";

/**
 * =====================================================
 * HelpMe Website Metadata
 * =====================================================
 *
 * Single Source of Truth
 * untuk metadata website.
 */

export const AppMetadata: Metadata = {
  title: {
    default: AppConfig.name,
    template: `%s | ${AppConfig.name}`,
  },

  description:
    "Marketplace bantuan harian untuk menghubungkan pengguna dengan helper terpercaya.",

  applicationName: AppConfig.name,

  metadataBase: new URL(AppConfig.appUrl),

  keywords: [
    "HelpMe",
    "Marketplace",
    "Jasa",
    "Helper",
    "Kurir",
    "Antri",
    "Belanja",
    "Teman",
  ],

  authors: [
    {
      name: "HelpMe Team",
    },
  ],

  creator: "HelpMe",

  publisher: "HelpMe",

  robots: {
    index: true,
    follow: true,
  },
};