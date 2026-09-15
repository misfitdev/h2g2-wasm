import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Splash } from '@/components/Splash';
import { HEART_OF_GOLD } from '@/lib/heartOfGold';

describe('heart of gold art data', () => {
  it('has one pixel per cell of the grid', () => {
    expect(HEART_OF_GOLD.pixels.length).toBe(HEART_OF_GOLD.width * HEART_OF_GOLD.height);
  });

  it('came from half-block rows, so the height is even', () => {
    expect(HEART_OF_GOLD.height % 2).toBe(0);
  });

  it('indexes only colours that exist', () => {
    for (let i = 0; i < HEART_OF_GOLD.pixels.length; i++) {
      const index = HEART_OF_GOLD.pixels.charCodeAt(i) - 48;
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(HEART_OF_GOLD.palette.length);
    }
  });

  it('holds every colour as an r,g,b triple in range', () => {
    for (const entry of HEART_OF_GOLD.palette) {
      const parts = entry.split(',').map(Number);
      expect(parts).toHaveLength(3);
      for (const c of parts) {
        expect(c).toBeGreaterThanOrEqual(0);
        expect(c).toBeLessThanOrEqual(255);
      }
    }
  });
});

describe('Splash', () => {
  it('sizes the canvas to the art', () => {
    const { container } = render(<Splash onStart={() => {}} />);
    const canvas = container.querySelector('canvas')!;
    expect(canvas.width).toBe(HEART_OF_GOLD.width);
    expect(canvas.height).toBe(HEART_OF_GOLD.height);
  });

  it('starts the game when START is pressed', () => {
    const onStart = vi.fn();
    render(<Splash onStart={onStart} />);
    fireEvent.click(screen.getByRole('button', { name: 'START' }));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('starts on Enter and on Escape', () => {
    const onStart = vi.fn();
    render(<Splash onStart={onStart} />);
    const dialog = screen.getByRole('dialog');
    fireEvent.keyDown(dialog, { key: 'Enter' });
    fireEvent.keyDown(dialog, { key: 'Escape' });
    expect(onStart).toHaveBeenCalledTimes(2);
  });

  it('ignores other keys', () => {
    const onStart = vi.fn();
    render(<Splash onStart={onStart} />);
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'a' });
    expect(onStart).not.toHaveBeenCalled();
  });

  it('focuses START so the keyboard works immediately', () => {
    render(<Splash onStart={() => {}} />);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'START' }));
  });

  it('hides the decorative art from assistive tech', () => {
    const { container } = render(<Splash onStart={() => {}} />);
    expect(container.querySelector('canvas')).toHaveAttribute('aria-hidden', 'true');
  });
});
