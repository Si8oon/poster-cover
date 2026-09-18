import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Post Generator',
  description: 'Create stunning social media posts from your photos',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0a',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}