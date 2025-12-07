import { useEffect, useState } from 'react';
import styles from './DebugPanel.module.css';

interface DebugPanelProps {
  location: string;
  gitHash: string;
  wasmChecksum: string;
}

export function DebugPanel({ location, gitHash, wasmChecksum }: DebugPanelProps) {
  return (
    <div className={styles.debugPanel}>
      <span className={styles.debugItem}>Location: {location || '—'}</span>
      <span className={styles.debugItem}>Git: {gitHash}</span>
      <span className={styles.debugItem}>WASM: {wasmChecksum}</span>
    </div>
  );
}
