import { GitBranch, X } from 'lucide-react';
import { timelineRows, type Timeline } from '@/lib/timeline';
import styles from './ImprobabilityDrive.module.css';

interface ImprobabilityDriveProps {
  timeline: Timeline;
  open: boolean;
  onToggle: () => void;
  onJump: (id: number) => void;
}

export function ImprobabilityDrive({ timeline, open, onToggle, onJump }: ImprobabilityDriveProps) {
  const rows = timelineRows(timeline);

  return (
    <>
      <button
        type="button"
        className={`${styles.handle} ${open ? styles.handleOpen : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        aria-label={open ? 'Hide the timeline' : 'Show the timeline'}
        aria-expanded={open}
        aria-controls="improbability-drive"
        title="Improbability Drive (Ctrl+I)"
      >
        <GitBranch className={styles.handleIcon} aria-hidden="true" />
        <span className={styles.handleLabel}>DRIVE</span>
      </button>

      <aside
        id="improbability-drive"
        className={`${styles.pane} ${open ? styles.paneOpen : styles.paneClosed}`}
        aria-label="Improbability Drive timeline"
        aria-hidden={!open}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <span className={styles.title}>IMPROBABILITY DRIVE</span>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onToggle}
            aria-label="Close the timeline"
            tabIndex={open ? 0 : -1}
          >
            <X className={styles.closeIcon} aria-hidden="true" />
          </button>
        </div>

        <div className={styles.list}>
          {rows.length === 0 ? (
            <p className={styles.empty}>No turns yet.</p>
          ) : (
            rows.map((row) => (
              <button
                key={row.node.id}
                type="button"
                className={[
                  styles.row,
                  row.isCurrent ? styles.rowCurrent : '',
                  row.onCurrentPath ? '' : styles.rowOffPath,
                ].join(' ')}
                style={{ paddingLeft: `${0.5 + row.depth * 1.1}rem` }}
                onClick={() => onJump(row.node.id)}
                aria-current={row.isCurrent ? 'true' : undefined}
                tabIndex={open ? 0 : -1}
              >
                <span className={styles.marker} aria-hidden="true">
                  {row.isCurrent ? '>' : row.isBranchPoint ? '+' : ' '}
                </span>
                <span className={styles.command}>
                  {row.node.command ?? '(the beginning)'}
                </span>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}
