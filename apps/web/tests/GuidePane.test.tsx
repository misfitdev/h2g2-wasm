import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GuidePane } from '@/components/GuidePane';
import { getGuideEntry, normalizeLocation, FALLBACK_ENTRY, GUIDE_ENTRIES } from '@/lib/guideEntries';

describe('normalizeLocation', () => {
  it('lowercases and collapses punctuation', () => {
    expect(normalizeLocation('Front of House')).toBe('front of house');
    expect(normalizeLocation('  Vogon-Hold!  ')).toBe('vogon hold');
  });

  it('returns an empty string for punctuation-only input', () => {
    expect(normalizeLocation('---')).toBe('');
  });
});

describe('getGuideEntry', () => {
  it('matches a room name exactly', () => {
    expect(getGuideEntry('Bedroom').id).toBe('bedroom');
  });

  it('matches case- and punctuation-insensitively', () => {
    expect(getGuideEntry('front-of-HOUSE').id).toBe('house');
  });

  it('matches a room name containing an alias', () => {
    expect(getGuideEntry('Vogon Hold, Aft Section').id).toBe('vogon-ship');
  });

  it('prefers an exact alias over a substring match', () => {
    // 'dark' is also a substring of other room names; the exact hit must win.
    expect(getGuideEntry('Dark').id).toBe('dark');
  });

  it('falls back for an unknown room', () => {
    expect(getGuideEntry('Somewhere Entirely Unbudgeted')).toBe(FALLBACK_ENTRY);
  });

  it('falls back for an empty location', () => {
    expect(getGuideEntry('')).toBe(FALLBACK_ENTRY);
  });

  it('gives every entry a title, verdict, and body', () => {
    for (const entry of GUIDE_ENTRIES) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.verdict.length).toBeGreaterThan(0);
      expect(entry.body.length).toBeGreaterThan(0);
      expect(entry.aliases.length).toBeGreaterThan(0);
    }
  });
});

describe('GuidePane', () => {
  const noop = () => {};

  it('renders the entry for the current location', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    expect(screen.getByText('BEDS')).toBeInTheDocument();
  });

  it('shows the sensed location', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    expect(screen.getByText('Bedroom')).toBeInTheDocument();
  });

  it('renders the fallback entry for an unknown location', () => {
    render(<GuidePane location="Nowhere At All" open={true} onToggle={noop} />);
    expect(screen.getByText(FALLBACK_ENTRY.title)).toBeInTheDocument();
  });

  it('reports no fix when the location is empty', () => {
    render(<GuidePane location="" open={true} onToggle={noop} />);
    expect(screen.getByText('no fix')).toBeInTheDocument();
  });

  it('marks the pane hidden when closed', () => {
    render(<GuidePane location="Bedroom" open={false} onToggle={noop} />);
    expect(screen.getByLabelText(/Hitchhiker/i)).toHaveAttribute('aria-hidden', 'true');
  });

  it('calls onToggle when the handle is clicked', () => {
    const onToggle = vi.fn();
    render(<GuidePane location="Bedroom" open={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText('Consult the Guide'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('calls onToggle when the close button is clicked', () => {
    const onToggle = vi.fn();
    render(<GuidePane location="Bedroom" open={true} onToggle={onToggle} />);
    fireEvent.click(screen.getByLabelText('Close the Guide'));
    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('labels the handle by state', () => {
    const { rerender } = render(<GuidePane location="Bedroom" open={false} onToggle={noop} />);
    expect(screen.getByLabelText('Consult the Guide')).toHaveAttribute('aria-expanded', 'false');

    rerender(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    expect(screen.getByLabelText('Hide the Guide')).toHaveAttribute('aria-expanded', 'true');
  });

  it('takes the close button out of the tab order when closed', () => {
    render(<GuidePane location="Bedroom" open={false} onToggle={noop} />);
    expect(screen.getByLabelText('Close the Guide')).toHaveAttribute('tabindex', '-1');
  });
});

describe('GuidePane flicker', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const findScreen = () => document.querySelector('[role="region"]');

  it('flickers when the entry changes', () => {
    const { rerender } = render(<GuidePane location="Bedroom" open={true} onToggle={() => {}} />);
    const before = findScreen()?.className ?? '';

    rerender(<GuidePane location="Pub" open={true} onToggle={() => {}} />);
    expect(findScreen()?.className).not.toBe(before);
  });

  it('does not flicker when the room changes but the entry does not', () => {
    const { rerender } = render(<GuidePane location="Bedroom" open={true} onToggle={() => {}} />);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    const settled = findScreen()?.className ?? '';

    rerender(<GuidePane location="bed" open={true} onToggle={() => {}} />);
    expect(findScreen()?.className).toBe(settled);
  });

  it('stops flickering after the animation window', () => {
    const { rerender } = render(<GuidePane location="Bedroom" open={true} onToggle={() => {}} />);
    rerender(<GuidePane location="Pub" open={true} onToggle={() => {}} />);
    const during = findScreen()?.className ?? '';

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(findScreen()?.className).not.toBe(during);
  });
});

describe('GuidePane cross-references', () => {
  const noop = () => {};

  it('follows a cross-reference to its entry', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'BYPASSES' }));
    expect(screen.getByRole('heading', { name: 'BYPASSES' })).toBeInTheDocument();
  });

  it('shows a placeholder for a headword nobody has written', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'GRAVITY, LOCAL' }));
    expect(screen.getByRole('heading', { name: 'GRAVITY LOCAL' })).toBeInTheDocument();
    expect(screen.getByText('Not yet filed.')).toBeInTheDocument();
  });

  it('resolves a cross-reference via an alternate headword', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'BYPASSES' }));
    fireEvent.click(screen.getByRole('button', { name: 'LEOPARDS' }));
    fireEvent.click(screen.getByRole('button', { name: 'TOWELS' }));
    fireEvent.click(screen.getByRole('button', { name: 'TRAAL' }));
    expect(
      screen.getByRole('heading', { name: 'RAVENOUS BUGBLATTER BEAST OF TRAAL' })
    ).toBeInTheDocument();
  });

  it('walks back one step at a time', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'BYPASSES' }));
    fireEvent.click(screen.getByRole('button', { name: 'LEOPARDS' }));
    fireEvent.click(screen.getByRole('button', { name: /BACK/ }));
    expect(screen.getByRole('heading', { name: 'BYPASSES' })).toBeInTheDocument();
  });

  it('returns to the sensed room from anywhere in the trail', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    fireEvent.click(screen.getByRole('button', { name: 'BYPASSES' }));
    fireEvent.click(screen.getByRole('button', { name: 'LEOPARDS' }));
    fireEvent.click(screen.getByRole('button', { name: /Bedroom/ }));
    expect(screen.getByRole('heading', { name: 'BEDS' })).toBeInTheDocument();
    expect(screen.getByText(/SENSING/)).toBeInTheDocument();
  });

  it('hides the sensing line while browsing', () => {
    render(<GuidePane location="Bedroom" open={true} onToggle={noop} />);
    expect(screen.getByText(/SENSING/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'BYPASSES' }));
    expect(screen.queryByText(/SENSING/)).not.toBeInTheDocument();
  });
});

describe('guide entry data', () => {
  it('keeps topic entries out of room matching', async () => {
    const { getGuideEntry, FALLBACK_ENTRY } = await import('@/lib/guideEntries');
    // 'towels' is a topic entry; no room should ever resolve to it.
    expect(getGuideEntry('towels')).toBe(FALLBACK_ENTRY);
  });

  it('matches headwords ignoring case and punctuation', async () => {
    const { getGuideEntryByTitle } = await import('@/lib/guideEntries');
    expect(getGuideEntryByTitle('bypasses')?.id).toBe('bypasses');
    expect(getGuideEntryByTitle('Sirius  Cybernetics, Corporation')?.id).toBe('sirius-cybernetics');
    expect(getGuideEntryByTitle('')).toBeNull();
  });
});
