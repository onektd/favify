import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://favify.ktd.one';

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f6f8' },
    { media: '(prefers-color-scheme: dark)', color: '#0d0d11' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Favify — Free Favicon, App Icon & Web Manifest Studio',
    template: '%s | Favify',
  },
  description:
    'One mark, every tab and home screen — crafted in seconds. Free 100% client-side favicon.ico, pure vector SVG, iOS AppIcon, Android maskable icon, and PWA site.webmanifest generator.',
  applicationName: 'Favify',
  authors: [{ name: 'ktd.one', url: 'https://ktd.one' }],
  creator: 'ktd.one',
  publisher: 'ktd.one',
  keywords: [
    'favicon generator',
    'app icon generator',
    'ico converter',
    'svg favicon',
    'pwa manifest generator',
    'site.webmanifest',
    'apple-touch-icon',
    'android maskable icon',
    'ios appiconset',
    'realfavicongenerator alternative',
    'monogram icon generator',
    'favify',
    'ktd.one',
  ],
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Favify',
    title: 'Favify — Free Favicon, App Icon & Web Manifest Studio',
    description:
      'One mark, every tab and home screen — crafted in seconds. Craft favicons, iOS & Android app icons, and PWA manifests 100% in your browser.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 700,
        alt: 'Favify — App Icon, Favicon & Web Manifest Studio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Favify — Free Favicon, App Icon & Web Manifest Studio',
    description:
      'One mark, every tab and home screen — crafted in seconds. Craft favicons, iOS & Android app icons, and PWA manifests 100% in your browser.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'developer tools',
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Favify',
  alternateName: 'Favify Icon & Manifest Studio',
  url: SITE_URL,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    'One mark, every tab and home screen — crafted in seconds. Free 100% client-side favicon.ico, pure vector SVG, iOS AppIcon, Android maskable icon, and PWA site.webmanifest generator.',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Any',
  browserRequirements: 'Requires a modern HTML5 web browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  author: {
    '@type': 'Organization',
    name: 'ktd.one',
    url: 'https://ktd.one',
  },
  featureList: [
    'Multi-size favicon.ico binary encoder (16x16, 32x32, 48x48)',
    'Pure vector favicon.svg export with squircle, rounded, circle, and square masks',
    'Built-in monogram text and vector icon mark generator',
    'iOS Xcode AppIcon.appiconset and Android adaptive mipmap generator',
    'PWA site.webmanifest and 9-framework integration snippets (HTML, React, Next.js, Rails, Node, Gulp, Grunt, ASP.NET Core)',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen bg-bg text-fg antialiased">{children}</body>
    </html>
  );
}
