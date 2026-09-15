import { useEffect, useRef } from 'react';
import { HEART_OF_GOLD } from '@/lib/heartOfGold';
import styles from './Splash.module.css';

interface SplashProps {
  onStart: () => void;
}

/**
 * Title screen. The art is drawn to a canvas at its native 128x76 and scaled
 * up by CSS rather than rendered as text: the source is half-block ANSI, and
 * the terminal face has no block glyphs to render it with.
 */
export function Splash({ onStart }: SplashProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const startRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const { width, height, palette, pixels } = HEART_OF_GOLD;
    const rgb = palette.map((entry) => entry.split(',').map(Number));
    const image = context.createImageData(width, height);

    for (let i = 0; i < pixels.length; i++) {
      const [r, g, b] = rgb[pixels.charCodeAt(i) - 48];
      const o = i * 4;
      image.data[o] = r;
      image.data[o + 1] = g;
      image.data[o + 2] = b;
      image.data[o + 3] = 255;
    }
    context.putImageData(image, 0, 0);
  }, []);

  useEffect(() => {
    startRef.current?.focus();
  }, []);

  // Listen on the document: clicking the art moves focus to <body>, and a
  // handler bound to this element would never see the key.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onStart();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onStart]);

  return (
    <div
      className={styles.splash}
      role="dialog"
      aria-modal="true"
      aria-label="The Hitchhiker's Guide to the Galaxy"
    >
      <canvas
        ref={canvasRef}
        width={HEART_OF_GOLD.width}
        height={HEART_OF_GOLD.height}
        className={styles.art}
        aria-hidden="true"
      />

      <button ref={startRef} type="button" className={styles.start} onClick={onStart}>
        START
      </button>

      <p className={styles.hint}>Share and Enjoy</p>
    </div>
  );
}
