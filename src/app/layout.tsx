import type { Metadata }
  from "next";

import Script from "next/script";

import ModerationGuard
  from "@/components/moderation/ModerationGuard";

import "./globals.css";

import AuthProvider from
  "@/features/auth/providers/AuthProvider";

import MidtransScript
from "@/components/payments/MidtransScript";

export const metadata: Metadata = {
  title: "HelpMe",

  description:
    "Marketplace bantuan harian",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-100">

        <AuthProvider>

          <ModerationGuard />

          <MidtransScript />

          {children}

        </AuthProvider>

      </body>
      
    </html>
  );
}