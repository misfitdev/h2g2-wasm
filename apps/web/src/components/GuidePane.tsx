import { useEffect, useState } from 'react';
import { BookOpen, X } from 'lucide-react';
import { getGuideEntry } from '@/lib/guideEntries';
import styles from './GuidePane.module.css';

/** Kept in sync with the guideFlicker keyframes duration. */
const FLICKER_DURATION = 420;

interface GuidePaneProps {
  location: string;
  open: boolean;
  onToggle: () => void;
}

export function GuidePane({ location, open, onToggle }: GuidePaneProps) {
  const entry = getGuideEntry(location);
  const [flickerFor, setFlickerFor] = useState<string | null>(null);
  const [renderedEntryId, setRenderedEntryId] = useState(entry.id);

  // Re-flicker the CRT whenever the Guide swaps entries, not on every turn in
  // the same room.
  if (renderedEntryId !== entry.id) {
    setRenderedEntryId(entry.id);
    setFlickerFor(open ? entry.id : null);
  }

  useEffect(() => {
    if (flickerFor === null) return;
    const timer = setTimeout(() => setFlickerFor(null), FLICKER_DURATION);
    return () => clearTimeout(timer);
  }, [flickerFor]);

  const flickering = flickerFor !== null;

  return (
    <>
      <button
        type="button"
        className={`${styles.handle} ${open ? styles.handleOpen : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={open ? 'Hide the Guide' : 'Consult the Guide'}
        aria-expanded={open}
        aria-controls="guide-pane"
        title="Sub-Etha Sens-O-Matic (Ctrl+G)"
      >
        <BookOpen className={styles.handleIcon} aria-hidden="true" />
        <span className={styles.handleLabel}>GUIDE</span>
      </button>

      <aside
        id="guide-pane"
        className={`${styles.pane} ${open ? styles.paneOpen : styles.paneClosed}`}
        aria-label="The Hitchhiker's Guide to the Galaxy"
        aria-hidden={!open}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.deviceName}>SUB-ETHA SENS-O-MATIC</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onToggle}
            aria-label="Close the Guide"
            tabIndex={open ? 0 : -1}
          >
            <X className={styles.closeIcon} aria-hidden="true" />
          </button>
        </div>

        <div
          className={`${styles.screen} ${flickering ? styles.flicker : ''}`}
          role="region"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className={styles.sensing}>
            SENSING: <span className={styles.sensingValue}>{location || 'no fix'}</span>
          </p>

          <h2 className={styles.title}>{entry.title}</h2>
          <p className={styles.verdict}>{entry.verdict}</p>

          <div className={styles.body}>
            {entry.body.map((paragraph, i) => (
              <p key={i} className={styles.paragraph}>
                {paragraph}
              </p>
            ))}
          </div>

          {entry.crossRefs && entry.crossRefs.length > 0 && (
            <div className={styles.crossRefs}>
              <p className={styles.crossRefsLabel}>SEE ALSO</p>
              <ul className={styles.crossRefsList}>
                {entry.crossRefs.map((ref) => (
                  <li key={ref} className={styles.crossRef}>
                    {ref}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <p className={styles.footer}>DON&apos;T PANIC</p>
      </aside>
    </>
  );
}
