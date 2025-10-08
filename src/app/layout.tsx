import type { Metadata } from "next";
import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Atom Connect - Trainer & Organization Platform",
  description: "Connect platform for trainers, organizations, and maintainers. Built with Next.js, TypeScript, and Tailwind CSS.",
  keywords: ["Atom Connect", "Next.js", "TypeScript", "Tailwind CSS", "Trainer", "Organization", "Platform"],
  authors: [{ name: "Atom Code Dev" }],
  openGraph: {
    title: "Atom Connect",
    description: "Connect platform for trainers and organizations",
    url: "https://atom-connect.vercel.app",
    siteName: "Atom Connect",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Atom Connect",
    description: "Connect platform for trainers and organizations",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
