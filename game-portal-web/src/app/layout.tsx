import './globals.scss';
import type { Metadata } from 'next';
import { Silkscreen } from 'next/font/google';

import styles from './layout.module.scss';


const silkscreen = Silkscreen({ weight: ['400', '700'], subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Mossland Metaverse Game Portal',
  description: 'Mossland Metaverse Game Portal',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={[silkscreen.className, styles.body].join(' ')}>{children}</body>
    </html>
  )
}
