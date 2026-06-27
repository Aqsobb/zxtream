import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Z.XTREAM - Watch Anime Online',
  description: 'Watch anime online for free. Stream thousands of anime episodes in HD quality.',
  keywords: ['anime', 'streaming', 'watch anime', 'free anime', 'anime online'],
  authors: [{ name: 'Z.XTREAM' }],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: 'Z.XTREAM',
    title: 'Z.XTREAM - Watch Anime Online',
    description: 'Watch anime online for free. Stream thousands of anime episodes in HD quality.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Z.XTREAM - Watch Anime Online',
    description: 'Watch anime online for free. Stream thousands of anime episodes in HD quality.',
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
  themeColor: '#0B0C0E',
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
              background: '#1A1B1E',
              color: '#fff',
              border: '1px solid #373A40',
            },
          }}
        />
      </body>
    </html>
  );
}
