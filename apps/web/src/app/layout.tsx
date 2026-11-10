import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Your Store | Online Shopping", template: "%s | Your Store" },
  description: "Explore a growing range of food, home and lifestyle essentials. Retail and wholesale shopping across India.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
    <body className="flex min-h-full flex-col bg-white text-slate-900">{children}</body>
  </html>;
}
