import Image from 'next/image'
import styles from './page.module.scss'

export default function Home() {
  return (
    <main className={styles.main}>
      <nav></nav>
      <div className={styles.description}>
        <a>Rock, Paper, Scissors</a>
      </div>
    </main>
  );
}
