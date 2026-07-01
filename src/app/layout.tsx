import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: {
    default: 'Z.XTREAM - Nonton Donghua & Drama Sub Indo',
    template: '%s | Z.XTREAM',
  },
  description: 'Nonton streaming donghua, anime China, dan short drama subtitle Indonesia gratis. Update cepat, kualitas terbaik, tanpa iklan.',
  keywords: ['donghua', 'anime china', 'short drama', 'streaming', 'subtitle indonesia', 'nonton gratis'],
  authors: [{ name: 'Z.XTREAM' }],
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Z.XTREAM',
    title: 'Z.XTREAM - Nonton Donghua & Drama Sub Indo',
    description: 'Nonton streaming donghua, anime China, dan short drama subtitle Indonesia gratis. Update cepat, kualitas terbaik, tanpa iklan.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z.XTREAM - Nonton Donghua & Drama Sub Indo',
    description: 'Nonton streaming donghua, anime China, dan short drama subtitle Indonesia gratis. Update cepat, kualitas terbaik, tanpa iklan.',
  },
  manifest: '/manifest.json',
  icons: {
    icon: '/icons/favicon.ico',
    shortcut: '/icons/favicon-16x16.png',
    apple: '/icons/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: [{ media: '(prefers-color-scheme: dark)', color: '#080a14' }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#0e1020',
              color: '#e0e8ff',
              border: '1px solid rgba(0, 229, 255, 0.15)',
            },
          }}
        />
      </body>
    </html>
  );
}
