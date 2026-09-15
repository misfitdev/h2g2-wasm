import { MAX_SCORE, renderBar } from '@/lib/scoreMeter';
import styles from './ScoreMeter.module.css';

interface ScoreMeterProps {
  location: string;
  score: number;
  turns: number;
}

export function ScoreMeter({ location, score, turns }: ScoreMeterProps) {
  return (
    <div className={styles.strip} role="status" aria-live="polite">
      <span className={styles.location}>{location || ' '}</span>
      <span className={styles.meter}>
        <span className={styles.label}>BUREAUCRACY</span>
        <span className={styles.bar} aria-hidden="true">
          [{renderBar(score)}]
        </span>
        <span className={styles.value}>
          {score}/{MAX_SCORE}
        </span>
        <span className={styles.turns}>{turns} turns</span>
      </span>
    </div>
  );
}
