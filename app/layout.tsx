import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";
import { AppProviders } from "./providers";
import { Shell } from "@/components/layout/Shell";

const inter = Inter({ subsets: ["latin"], variable: "--font-geist-sans" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

export const metadata: Metadata = {
  title: "Physik Notiz-Archiv",
  description: "Notizen, Termine und Dokumentation für das Physikstudium"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
