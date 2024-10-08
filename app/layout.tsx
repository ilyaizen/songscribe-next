import type { Metadata } from 'next';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Providers } from '@/components/Providers';

export const metadata: Metadata = {
  title: 'SongScribe',
  description: 'Translate songs to Hebrew with ease',
  keywords: ['song translation', 'Hebrew lyrics', 'music translation'],
  openGraph: {
    title: 'SongScribe',
    description: 'Translate songs to Hebrew with ease',
    images: ['/og-image.png'],
    type: 'website',
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
