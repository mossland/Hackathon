
import styles from './layout.module.scss';




export default function FaucetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <section className={styles.faucetPanel}>
        { children }
    </section>
  )
}
