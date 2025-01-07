"use client"
import { useEffect, useState } from "react";
import Link from "next/link";
import styles from './page.module.scss'

const gameList = [
    {
        link: `/client/RockPaperScissors/index.html?token=`,
        name: 'Rock, Paper, Scissors',
        isAvailable: true,
    },
    {
      link: `/client/HeadsOrTails/index.html?token=`,
      name: 'Heads or Tails',
      isAvailable: true,
    },
    {
      link: `/client/PizzaRevolution/index.html?token=`,
      name: 'PizzaRevolution',
      isAvailable: false,
    },
    // {
    //     link: `/client/HolyGali/index.html?token=`,
    //     name: 'Holy Gali',
    //     isAvailable: false,
    // },
    // {
    //     link: `/client/ryb/index.html?token=`,
    //     name: 'Red, Yellow, Blue',
    //     isAvailable: false,
    // },
];

export function GameListViewLoading() {
    return (
        <ul className={styles.gameList}>
          {
            gameList.map((game, idx) => {
              return (
                  <li key={idx} className={`${styles.gameEle} ${styles.loadingElement}`}>
                    <div className={styles.gameLink}>
                        <span className={styles.gameName}>{ game.name }</span>
                    </div>
                  </li>
              );
            })
          }
        </ul>
    );
}

export default function GameListView() {
    const [ curSelect, setCurSelect ] = useState(0);
    const [ token, setToken ] = useState('');

    useEffect(() => {
        setToken(window.sessionStorage.getItem('token') ?? '');
    }, [window.sessionStorage.getItem('token')]);
    
    
    const hovering = (idx: number) => {
        if (!gameList[idx] || !gameList[idx].isAvailable) return;
        setCurSelect(idx);
    };

    return (
        <ul className={styles.gameList}>
          {
            gameList.map((game, index) => {
              return (
                  <li key={game.link} onMouseEnter={() => { hovering(index) }} className={`${styles.gameEle} ${game.isAvailable ? '' : styles.disable} ${index === curSelect ? styles.select : ''}`}>
                    {
                      game.isAvailable ?
                        <Link className={styles.gameLink} href={`${game.link}${token}`}><span className={styles.gameName}>{ game.name }</span></Link>
                        :
                        <div className={styles.gameLink}><span className={styles.gameName}>{ game.name }</span></div>
                    }
                  </li>
              );
            })
          }
        </ul>
    );
}