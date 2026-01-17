import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import localFont from "next/font/local";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

// Montreal - Primary font (local)
const montreal = localFont({
  src: [
    {
      path: "../../public/fonts/PPNeueMontreal-Book.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/PPNeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../public/fonts/PPNeueMontreal-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-montreal",
  display: "swap",
});

// Inter - Fallback font (Google)
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
  },
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
      <body
        className={`${montreal.variable} ${inter.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
