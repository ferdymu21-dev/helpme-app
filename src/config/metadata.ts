import type { Metadata } from "next";

import { AppConfig } from "./app";

export const AppMetadata: Metadata = {
  title: {
    default: AppConfig.name,
    template: `%s | ${AppConfig.name}`,
  },

  description:
    "Platform bantuan harian untuk menemukan helper terpercaya saat Anda membutuhkan bantuan antri, antar dan ambil, dokumen, belanja, pindahan, pengecekan lokasi, dan kebutuhan lainnya.",

  applicationName: AppConfig.name,

  metadataBase: new URL(AppConfig.appUrl),

  keywords: [
  "HelpMe",
  "bantuan harian",
  "helper",
  "jasa bantuan",
  "jasa antri",
  "antar dan ambil",
  "ambil dokumen",
  "bantuan administrasi",
  "titip belanja",
  "bantuan pindahan",
  "cek lokasi",
  "survei lokasi",
  "teman acara",
  "bantuan sehari-hari",
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