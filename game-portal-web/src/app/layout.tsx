import './globals.scss';
import type { Metadata } from 'next';
import Link from 'next/link';

import localFont from 'next/font/local';
import { Silkscreen } from 'next/font/google';

import layoutStyles from './layout.module.scss';
import styles from './page.module.scss'

const ka = localFont({ src: '../../public/font/ka1.ttf'});
const silkscreen = Silkscreen({ weight: ['400', '700'], subsets: ['latin'], fallback: ['DungGeunMo']  });

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
      <body className={[silkscreen.className, layoutStyles.body].join(' ')}>
        <main className={styles.main}>
          <nav>
            <div className={[ka.className, styles.title].join(' ')}>
              <Link href={'/'}>
                Mossland Metaverse<br />
                Game Portal<br />
              </Link>
            </div>
            <div className={ styles.menu }>
              <ol className={ styles.menuList}>
                <li className={ [styles.home, styles.menuItem].join(' ') }>
                  <Link href={'/'}>Home</Link>
                </li>
                <li className={ [styles.faucet, styles.menuItem].join(' ') }>
                  <Link href={'/faucet'}>Faucet</Link>
                </li>
                {/* <li className={ [styles.rank, styles.menuItem].join(' ') }><Link href={'/rank'}>Rank</Link></li>
                <li className={ [styles.help, styles.menuItem].join(' ') }><Link href={'/help'}>Help</Link></li> */}
              </ol>
            </div>
          </nav>
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </body>
    </html>
  )
}
