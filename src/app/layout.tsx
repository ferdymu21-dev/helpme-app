import type { Metadata }
from "next";

import "./globals.css";

import AuthProvider from
"@/features/auth/providers/AuthProvider";

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
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}