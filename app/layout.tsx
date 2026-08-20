import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RegisterSW } from "@/components/RegisterSW";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://german-tutor-weld.vercel.app";

const DESCRIPTION =
  "The AI German tutor that remembers every mistake you make and builds your practice around it — A1 to B2 lessons, live corrections, drills, and a full grammar reference. Free.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Deutsch-Tutor",
  description: DESCRIPTION,
  openGraph: {
    title: "Deutsch-Tutor",
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: "Deutsch-Tutor",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Deutsch-Tutor",
    description: DESCRIPTION,
    images: ["/og-image.png"],
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Deutsch-Tutor",
  },
};

// Paints the browser/OS chrome to match the app surface — groundwork for
// installing this as a PWA.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
    { media: "(prefers-color-scheme: dark)", color: "#18181b" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      {/* The app is a fixed-height shell, never a scrolling document: only the
          per-tab content areas scroll, so the input bar and the phone tab bar
          can never be pushed below the fold. */}
      <body className="flex h-full flex-col overflow-hidden">
        <RegisterSW />
        {children}
      </body>
    </html>
  );
}
