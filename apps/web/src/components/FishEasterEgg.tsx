import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './FishEasterEgg.module.css';

const VIDEO_PATH = '/video/fish-ascii.mp4';

function reducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

export function FishEasterEgg() {
  const [motionReduced] = useState(reducedMotion);
  const [videoAvailable, setVideoAvailable] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [videoDuration, setVideoDuration] = useState(0);
  const [fullSize, setFullSize] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const stillRef = useRef<HTMLCanvasElement>(null);
  const exitRef = useRef<HTMLButtonElement>(null);

  const exit = useCallback(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete('ee');
    window.location.assign(url.toString());
  }, []);

  useEffect(() => {
    exitRef.current?.focus();
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') exit();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [exit]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!videoAvailable || !video) return;
    if (playing) {
      video.pause();
      setPlaying(false);
      return;
    }
    if (video.ended) video.currentTime = 0;
    void video.play().then(() => setPlaying(true)).catch(() => setVideoError(true));
  }, [playing, videoAvailable]);

  const replay = useCallback(() => {
    const video = videoRef.current;
    if (!videoAvailable || !video) return;
    video.currentTime = 0;
    setElapsed(0);
    void video.play().then(() => setPlaying(true)).catch(() => setVideoError(true));
  }, [videoAvailable]);

  return (
    <section className={`${styles.screen} scanlines`} role="dialog" aria-modal="true" aria-label="Dolphin departure">
      <div className={styles.controls}>
        <button ref={exitRef} type="button" onClick={exit}>[ ESCAPE TO GAME ]</button>
        <button type="button" onClick={togglePlayback} disabled={!videoAvailable}>{playing ? '[ PAUSE ]' : '[ PLAY ]'}</button>
        <button type="button" onClick={replay} disabled={!videoAvailable}>[ REPLAY ]</button>
        {videoAvailable && (
          <button type="button" aria-pressed={fullSize} onClick={() => setFullSize((value) => !value)}>
            {fullSize ? '[ FIT VIEW ]' : '[ FULL SIZE ]'}
          </button>
        )}
      </div>
      <h1 className={styles.heading}>SO LONG, AND THANKS FOR ALL THE FISH</h1>
      <div className={styles.viewport}>
        {videoError && <p className={styles.missing} role="alert">The dolphins missed their cue. The ASCII video could not be played.</p>}
        {!videoAvailable && !videoError && <p className={styles.missing} role="status">Locating the dolphins...</p>}
        <video
          ref={videoRef}
          className={`${styles.video} ${fullSize ? styles.fullSize : ''} ${motionReduced || !videoAvailable ? styles.audioOnlyVideo : ''}`}
          src={VIDEO_PATH}
          preload="auto"
          playsInline
          aria-label="Faded color ASCII dolphin departure video"
          onLoadedMetadata={(event) => {
            setVideoDuration(event.currentTarget.duration);
            setVideoAvailable(true);
            setVideoError(false);
          }}
          onLoadedData={(event) => {
            if (motionReduced) {
              const still = stillRef.current;
              const context = still?.getContext('2d');
              if (still && context) {
                still.width = event.currentTarget.videoWidth;
                still.height = event.currentTarget.videoHeight;
                context.drawImage(event.currentTarget, 0, 0, still.width, still.height);
              }
            }
          }}
          onTimeUpdate={(event) => setElapsed(event.currentTarget.currentTime * 1000)}
          onEnded={() => setPlaying(false)}
          onError={() => {
            setVideoAvailable(false);
            setVideoError(true);
          }}
        />
        {motionReduced && (
          <canvas ref={stillRef} className={`${styles.video} ${fullSize ? styles.fullSize : ''}`} style={{ visibility: videoAvailable ? 'visible' : 'hidden' }} aria-hidden="true" />
        )}
      </div>
      <p className="sr-only">The film clip is pre-rendered as 480-column, faded color ASCII. Its original audio plays in sync.</p>
      <div className={styles.footer}>
        <p role="status">{videoAvailable ? 'ASCII VIDEO · 480 COLUMNS · FADED COLOR · ORIGINAL AUDIO' : 'VIDEO NOT LOADED'}</p>
        <p>{motionReduced ? 'STILL FRAME · AUDIO AVAILABLE' : `${Math.floor(elapsed / 1000).toString().padStart(2, '0')} / ${Math.floor(videoDuration)}s · ${playing ? 'IN FLIGHT' : 'STANDING BY'}`}</p>
      </div>
    </section>
  );
}
