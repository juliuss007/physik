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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),

  title: "PHYSIK RESEARCH ARCHIVE",
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

  // Open Graph
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "PHYSIK RESEARCH ARCHIVE",
    title: "PHYSIK RESEARCH ARCHIVE",
    description: "Technical documentation system for physics research and laboratory protocols",
    images: [
      {
        url: "/ogimage.png",
        width: 1456,  // Actual dimensions of your ogimage.png
        height: 816,
        alt: "PHYSIK RESEARCH ARCHIVE",
        type: "image/png",
      }
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "PHYSIK RESEARCH ARCHIVE",
    description: "Technical documentation system for physics research and laboratory protocols",
    images: ["/ogimage.png"],
  },

  // Additional metadata
  manifest: "/site.webmanifest",  // For PWA support (optional)
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
