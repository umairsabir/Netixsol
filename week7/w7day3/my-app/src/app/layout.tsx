import type { Metadata } from 'next';
import './globals.css';
import { ReduxProvider } from '@/providers/ReduxProvider';

export const metadata: Metadata = {
  title: 'Circlechain — Save, Buy and Sell Your Blockchain Asset',
  description:
    'The easy to manage and trade your cryptocurrency asset. Buy and sell blockchain assets anytime with Circlechain — the Web3 platform built for everyone.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ background: '#010010', minHeight: '100vh' }}>
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
