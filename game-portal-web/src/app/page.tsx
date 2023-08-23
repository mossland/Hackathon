"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import localFont from 'next/font/local';
import { useState } from 'react';

import styles from './page.module.scss'


const ka = localFont({ src: '../../public/font/ka1.ttf' });

export default function Home() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const [ curSelect, setCurSelect ] = useState(0);
  
  const gameList = [
    {
      link: `/client/RockPaperScissors/index.html?token=${token}`,
      name: 'Rock, Paper, Scissors',
      isAvailable: true,
    },
    {
      link: `/client/HolyGali/index.html?token=${token}`,
      name: 'Holy Gali',
      isAvailable: false,
    },
    {
      link: `/client/ryb/index.html?token=${token}`,
      name: 'Red, Yellow, Blue',
      isAvailable: false,
    },
  ];

  const hovering = (idx: number) => {
    if (!gameList[idx] || !gameList[idx].isAvailable) return;
    setCurSelect(idx);
  };

  return (
    <main className={styles.main}>
      <nav>
        <div className={[ka.className, styles.title].join(' ')}>
          Mossland Metaverse<br />
          Game Portal<br />
        </div>
      </nav>
      <div className={styles.content}>
        <ul className={styles.gameList}>
          {
            gameList.map((game, index) => {
              return (
                  <li key={game.link} onMouseEnter={() => { hovering(index) }} className={`${styles.gameEle} ${game.isAvailable ? '' : styles.disable} ${index === curSelect ? styles.select : ''}`}>
                    {
                      game.isAvailable ?
                        <Link className={styles.gameLink} href={game.link}><span className={styles.gameName}>{ game.name }</span></Link>
                        :
                        <div className={styles.gameLink}><span className={styles.gameName}>{ game.name }</span></div>
                    }
                  </li>
              );
            })
          }
          
        </ul>
        
      </div>
    </main>
  );
}
