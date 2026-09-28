import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from '@/pages/Index';

vi.mock('@/components/Terminal', () => ({
  Terminal: () => <div>Game terminal</div>,
}));

afterEach(() => {
  window.history.replaceState({}, '', '/');
});

describe('fish query route', () => {
  it('shows the departure without starting the game terminal', () => {
    window.history.replaceState({}, '', '/?ee=fish');
    render(<Index />);
    expect(screen.getByRole('dialog', { name: 'Dolphin departure' })).toBeInTheDocument();
    expect(screen.queryByText('Game terminal')).not.toBeInTheDocument();
  });

  it('keeps the terminal for unrelated query values', () => {
    window.history.replaceState({}, '', '/?ee=tea');
    render(<Index />);
    expect(screen.getByText('Game terminal')).toBeInTheDocument();
  });
});
