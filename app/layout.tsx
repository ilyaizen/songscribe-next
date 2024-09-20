import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'SongScribe',
  description: 'Translate songs to Hebrew',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    images: ['/og-image.png'],
    type: 'website',
    siteName: 'SongScribe',
    locale: 'en_US',
    title: 'SongScribe',
    description: 'Translate songs to Hebrew',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <Providers>
          <Header />
          <main className="flex-grow">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
