import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";
import { AppProviders } from "./providers";
import { Header } from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Physik Notiz-Tracker",
  description: "Next.js Dashboard für Notizen, Kalender und Prüfungen in der Physik"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className="antialiased">
      <head>
        <link rel="stylesheet" href="/katex/katex.min.css" />
      </head>
      <body className={`${inter.className} min-h-screen flex flex-col bg-background`}> 
        <AppProviders>
          <Header />
          <main className="flex-1 px-6 pb-12 pt-6 mx-auto w-full max-w-6xl space-y-6">{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
