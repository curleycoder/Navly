import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";
import { LocaleProvider } from "@/lib/i18n";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://navly.ca'),
  title: {
    default: 'Navly — Canadian PR Pathway Planner',
    template: '%s | Navly',
  },
  description:
    'Estimate your CRS score, track days in Canada, and understand your best path to permanent residence. Free PR pathway screening for immigrants.',
  keywords: ['Canada PR', 'Express Entry', 'CRS score', 'immigration', 'permanent residence', 'Canada days tracker', 'IRCC'],
  authors: [{ name: 'Navly' }],
  openGraph: {
    title: 'Navly — Canadian PR Pathway Planner',
    description: 'Estimate your CRS score, track days in Canada, and understand your best path to permanent residence.',
    url: 'https://navly.ca',
    siteName: 'Navly',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Navly — Canadian PR Pathway Planner',
      },
    ],
    locale: 'en_CA',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Navly — Canadian PR Pathway Planner',
    description: 'Estimate your CRS score, track days in Canada, and understand your best path to permanent residence.',
    images: ['/opengraph-image'],
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/apple-icon.svg',
  },
  themeColor: '#0B1F3A',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head></head>
      <body className={`${ibmPlexSans.variable} font-sans antialiased`}>
        <LocaleProvider>
          <a href="#main-content" className="skip-link">
            Skip to main content
          </a>
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}