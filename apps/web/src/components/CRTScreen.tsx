import { useEffect, useState } from 'react';
import styles from './CRTScreen.module.css';

/**
 * Ambient CRT overlay plus a one-shot power-on sequence.
 *
 * Everything here is decorative and pointer-events:none, layered above the
 * terminal text but below modals (z-index 98; boot backer at 300 during the
 * ~1.15s power-on, then unmounted). The power-on is removed on a fixed timer
 * rather than animationend so it can never get stuck on screen, even when
 * prefers-reduced-motion shortens or skips the animation.
 */
export function CRTScreen() {
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    // 1.3s > the 1.15s CSS animation; the reduced-motion path is shorter still.
    const timer = setTimeout(() => setBooting(false), 1300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <div className={styles.layer} aria-hidden="true">
        <div className={styles.scanlines} />
        <div className={styles.beam} />
        <div className={styles.vignette} />
        <div className={styles.aberration} />
        <div className={styles.flicker} />
      </div>
      {booting && <div className={styles.boot} aria-hidden="true" />}
    </>
  );
}
