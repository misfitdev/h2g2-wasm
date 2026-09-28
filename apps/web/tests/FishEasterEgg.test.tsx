import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FishEasterEgg } from '@/components/FishEasterEgg';

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function loadMockVideo(container: HTMLElement) {
  const video = container.querySelector('video');
  if (!video) throw new Error('Missing video element');
  Object.defineProperty(video, 'duration', { value: 152.08, configurable: true });
  fireEvent.loadedMetadata(video);
  return video;
}

describe('Fish Easter egg', () => {
  it('loads one pre-rendered 480-column video containing picture and audio', () => {
    const { container } = render(<FishEasterEgg />);
    expect(screen.getByRole('dialog', { name: 'Dolphin departure' })).toBeInTheDocument();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: /escape to game/i }));
    const video = container.querySelector('video');
    expect(video).toHaveAttribute('src', '/video/fish-ascii.mp4');
    expect(video?.muted).toBe(false);
    expect(container.querySelector('audio')).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '[ PLAY ]' })).toBeDisabled();
    loadMockVideo(container);
    expect(screen.getByText(/480 COLUMNS · FADED COLOR · ORIGINAL AUDIO/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '[ PLAY ]' })).toBeEnabled();
  });

  it('plays, pauses, and replays the converted MP4 with its own audio', async () => {
    const { container } = render(<FishEasterEgg />);
    const video = loadMockVideo(container);
    const play = vi.spyOn(video, 'play').mockResolvedValue();
    const pause = vi.spyOn(video, 'pause').mockImplementation(() => {});

    fireEvent.click(screen.getByRole('button', { name: '[ PLAY ]' }));
    await waitFor(() => expect(screen.getByRole('button', { name: /pause/i })).toBeInTheDocument());
    expect(play).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: /pause/i }));
    expect(pause).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: /replay/i }));
    expect(video.currentTime).toBe(0);
    expect(play).toHaveBeenCalledTimes(2);
  });

  it('offers fit and native 2880-pixel-wide views without changing the 480-column render', () => {
    const { container } = render(<FishEasterEgg />);
    const video = loadMockVideo(container);
    fireEvent.click(screen.getByRole('button', { name: /full size/i }));
    expect(video.className).toContain('fullSize');
    fireEvent.click(screen.getByRole('button', { name: /fit view/i }));
    expect(video.className).not.toContain('fullSize');
  });

  it('holds one ASCII frame for reduced motion while keeping video audio available', () => {
    vi.stubGlobal('matchMedia', () => ({ matches: true }));
    const { container } = render(<FishEasterEgg />);
    const canvas = container.querySelector('canvas');
    if (!canvas) throw new Error('Missing still canvas');
    const drawImage = vi.fn();
    Object.defineProperty(canvas, 'getContext', { value: () => ({ drawImage }) });
    const video = loadMockVideo(container);
    Object.defineProperty(video, 'videoWidth', { value: 2880, configurable: true });
    Object.defineProperty(video, 'videoHeight', { value: 1200, configurable: true });
    fireEvent.loadedData(video);
    expect(drawImage).toHaveBeenCalledOnce();
    expect(canvas).toHaveAttribute('width', '2880');
    expect(canvas).toHaveAttribute('height', '1200');
    expect(screen.getByText('STILL FRAME · AUDIO AVAILABLE')).toBeInTheDocument();
  });
});
