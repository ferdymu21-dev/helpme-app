import type { Metadata } from "next";

import "./globals.css";

// import Navbar from "@/components/layout/Navbar";

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
        {/* <Navbar /> */}

        {children}
      </body>
    </html>
  );
}