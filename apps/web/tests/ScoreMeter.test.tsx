import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoreMeter } from '@/components/ScoreMeter';

describe('ScoreMeter', () => {
  it('shows the location, score and turns', () => {
    render(<ScoreMeter location="Bedroom" score={0} turns={0} />);
    expect(screen.getByText('Bedroom')).toBeInTheDocument();
    expect(screen.getByText('0/400')).toBeInTheDocument();
    expect(screen.getByText('0 turns')).toBeInTheDocument();
  });

  it('fills the bar as the score rises', () => {
    const { rerender, container } = render(<ScoreMeter location="Bedroom" score={0} turns={1} />);
    const barAtZero = container.textContent;

    rerender(<ScoreMeter location="Bedroom" score={200} turns={9} />);
    expect(container.textContent).not.toBe(barAtZero);
    expect(container.textContent).toContain('[============............]');
    expect(screen.getByText('200/400')).toBeInTheDocument();
  });

  it('fills completely at 400', () => {
    const { container } = render(<ScoreMeter location="Milliways" score={400} turns={9} />);
    expect(container.textContent).toContain('[========================]');
  });

  it('announces itself politely to assistive tech', () => {
    render(<ScoreMeter location="Bedroom" score={5} turns={2} />);
    const strip = screen.getByRole('status');
    expect(strip).toHaveAttribute('aria-live', 'polite');
  });

  it('tolerates an empty location before the game reports one', () => {
    render(<ScoreMeter location="" score={0} turns={0} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
