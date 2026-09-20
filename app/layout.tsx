// app/layout.tsx
import type { Metadata } from 'next';
import {
  Anton,
  Bebas_Neue,
  Playfair_Display,
  Space_Grotesk,
  Archivo_Black,
  DM_Serif_Display,
  Outfit,
  Bricolage_Grotesque,
  Caveat_Brush,
  JetBrains_Mono,
  Permanent_Marker,
  Rock_Salt,
} from 'next/font/google';
import './globals.css';

const anton = Anton({ weight: '400', subsets: ['latin'], variable: '--font-anton', display: 'swap' });
const bebasNeue = Bebas_Neue({ weight: '400', subsets: ['latin'], variable: '--font-bebas', display: 'swap' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const archivoBlack = Archivo_Black({ weight: '400', subsets: ['latin'], variable: '--font-archivo-black', display: 'swap' });
const dmSerif = DM_Serif_Display({ weight: '400', subsets: ['latin'], variable: '--font-dm-serif', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });
const bricolage = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-bricolage', display: 'swap' });
const caveatBrush = Caveat_Brush({ weight: '400', subsets: ['latin'], variable: '--font-caveat-brush', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });
const permanentMarker = Permanent_Marker({ weight: '400', subsets: ['latin'], variable: '--font-permanent-marker', display: 'swap' });
const rockSalt = Rock_Salt({ weight: '400', subsets: ['latin'], variable: '--font-rock-salt', display: 'swap' });

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
  const fontClasses = [
    anton.variable,
    bebasNeue.variable,
    playfair.variable,
    spaceGrotesk.variable,
    archivoBlack.variable,
    dmSerif.variable,
    outfit.variable,
    bricolage.variable,
    caveatBrush.variable,
    jetbrainsMono.variable,
    permanentMarker.variable,
    rockSalt.variable,
  ].join(' ');

  return (
    <html lang="en">
      <body className={fontClasses}>{children}</body>
    </html>
  );
}