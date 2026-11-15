import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { brand, description, siteOrigin } from "@/lib/site";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteOrigin),
  title: { default: brand + " | FMCG & Everyday Essentials", template: "%s | " + brand },
  description,
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
    <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
  </html>;
}
