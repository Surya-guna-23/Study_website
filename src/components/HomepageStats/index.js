import Heading from '@theme/Heading';
import styles from './styles.module.css';

const STATS = [
  { value: '34+', label: 'Problems solved', color: '#25c2a0' },
  { value: '9', label: 'Easy', color: '#7ee2b8' },
  { value: '18', label: 'Medium', color: '#f5d67b' },
  { value: '7', label: 'Hard', color: '#f79a9a' },
  { value: '5', label: 'Patterns', color: '#89b4fa' },
  { value: '2', label: 'Languages', color: '#b4befe' },
];

export default function HomepageStats() {
  return (
    <section className={styles.stats}>
      <div className="container">
        <Heading as="h2" className={styles.statsTitle}>
          What&apos;s inside
        </Heading>
        <div className={styles.statsGrid}>
          {STATS.map((s, i) => (
            <div key={i} className={styles.statCard}>
              <div className={styles.statValue} style={{ color: s.color }}>
                {s.value}
              </div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
