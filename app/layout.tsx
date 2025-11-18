import type { Metadata, Viewport } from "next";
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
  metadataBase: new URL('https://physik.vercel.app'),

  title: {
    default: "Physik Konsole",
    template: "%s | Physik Konsole"
  },
  description: "Technical documentation system for physics research and laboratory protocols",

  // Icons - comprehensive browser support
  icons: {
    icon: [
      { url: "/PhysikLogoMinimal.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" }  // Fallback for legacy browsers
    ],
    shortcut: "/PhysikLogoMinimal.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
    ],
    other: [
      { rel: "mask-icon", url: "/PhysikLogoMinimal.svg", color: "#FF4F00" }  // Safari pinned tab
    ]
  },

  // Open Graph - image handled by app/opengraph-image.jpg
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Physik Konsole",
    title: "Physik Konsole",
    description: "Technical documentation system for physics research and laboratory protocols",
  },

  // Twitter Card - image handled by app/opengraph-image.jpg
  twitter: {
    card: "summary_large_image",
    title: "Physik Konsole",
    description: "Technical documentation system for physics research and laboratory protocols",
  },

  // Additional metadata
  manifest: "/site.webmanifest",  // For PWA support (optional)
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",  // Dark background color
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
