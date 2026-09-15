import { MAX_SCORE, renderBar } from '@/lib/scoreMeter';
import styles from './ScoreMeter.module.css';

interface ScoreMeterProps {
  location: string;
  /** null when the engine reports no score, e.g. a time-based game. */
  score: number | null;
  turns: number | null;
}

export function ScoreMeter({ location, score, turns }: ScoreMeterProps) {
  const hasScore = score !== null && turns !== null;

  return (
    <div className={styles.strip} role="status" aria-live="polite">
      <span className={styles.location}>{location || ' '}</span>
      {hasScore && (
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
      )}
    </div>
  );
}
