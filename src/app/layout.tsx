import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "primariaTa❤️\_ - Primăria ta digitală",
    template: "%s | primariaTa",
  },
  description:
    "Platformă SaaS white-label care digitalizează complet procesele administrative locale din România. Servicii publice digitale accesibile, transparente și eficiente.",
  keywords: [
    "primărie digitală",
    "servicii publice",
    "digitalizare",
    "administrație locală",
    "România",
    "e-government",
    "platformă SaaS",
  ],
  authors: [{ name: "primariaTa Team" }],
  creator: "primariaTa",
  publisher: "primariaTa",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://primariata.work"),
  openGraph: {
    type: "website",
    locale: "ro_RO",
    url: "/",
    siteName: "primariaTa",
    title: "primariaTa❤️\_ - Primăria ta digitală",
    description:
      "Platformă SaaS white-label care digitalizează complet procesele administrative locale din România.",
    images: [
      {
        url: "/opengraph-image.png",
        width: 500,
        height: 500,
        alt: "primariaTa Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "primariaTa❤️\_ - Primăria ta digitală",
    description: "Platformă SaaS white-label care digitalizează procesele administrative locale.",
    images: ["/opengraph-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "500x500", type: "image/png" },
      { url: "/logo_fav.png", sizes: "500x500", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "500x500", type: "image/png" }],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
