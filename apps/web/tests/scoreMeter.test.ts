import { describe, it, expect } from 'vitest';
import { renderBar, MAX_SCORE } from '@/lib/scoreMeter';
import { milestonesCrossed } from '@/lib/scoreMilestones';

describe('renderBar', () => {
  it('is empty at zero', () => {
    expect(renderBar(0)).toBe('.'.repeat(24));
  });

  it('is full at the maximum', () => {
    expect(renderBar(MAX_SCORE)).toBe('='.repeat(24));
  });

  it('is half full at half the maximum', () => {
    expect(renderBar(MAX_SCORE / 2)).toBe('='.repeat(12) + '.'.repeat(12));
  });

  it('keeps a constant width at every score', () => {
    for (let s = 0; s <= MAX_SCORE; s += 7) expect(renderBar(s)).toHaveLength(24);
  });

  it('clamps out-of-range scores rather than overflowing', () => {
    expect(renderBar(-50)).toBe('.'.repeat(24));
    expect(renderBar(MAX_SCORE * 2)).toBe('='.repeat(24));
  });

  it('survives a zero maximum', () => {
    expect(renderBar(10, 0)).toHaveLength(24);
  });

  it('uses only characters the VT220 face can render', () => {
    expect(renderBar(123)).toMatch(/^[=.]+$/);
  });
});

describe('milestonesCrossed', () => {
  it('says nothing when the score has not moved', () => {
    expect(milestonesCrossed(50, 50)).toEqual([]);
  });

  it('says nothing when the score went backwards', () => {
    expect(milestonesCrossed(100, 25)).toEqual([]);
  });

  it('reports the threshold just crossed', () => {
    expect(milestonesCrossed(0, 1)).toHaveLength(1);
  });

  it('reports every threshold crossed in one jump', () => {
    expect(milestonesCrossed(0, 100)).toHaveLength(4);
  });

  it('does not repeat a threshold already passed', () => {
    expect(milestonesCrossed(25, 40)).toEqual([]);
  });

  it('reports the maximum exactly once', () => {
    expect(milestonesCrossed(399, 400)).toHaveLength(1);
    expect(milestonesCrossed(400, 400)).toEqual([]);
  });
});
