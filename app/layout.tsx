import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";

import "./globals.css";
import { AppProviders } from "./providers";
import { Shell } from "@/components/layout/Shell";

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-mono"
});

export const metadata: Metadata = {
  title: "PHYSIK RESEARCH ARCHIVE",
  description: "Technical documentation system for physics research and laboratory protocols"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={ibmPlexMono.variable}>
      <body className="min-h-screen bg-background text-foreground antialiased font-mono">
        <AppProviders>
          <Shell>{children}</Shell>
        </AppProviders>
      </body>
    </html>
  );
}
