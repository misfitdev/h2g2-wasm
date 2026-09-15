import { describe, it, expect } from 'vitest';
import {
  GUIDE_ENTRIES,
  FALLBACK_ENTRY,
  getGuideEntryByTitle,
  normalizeHeadword,
} from '@/lib/guideEntries';

/** Every headword reachable by following SEE ALSO from a room or the fallback. */
function reachableHeadwords(): string[] {
  const found = new Set<string>();
  const visited = new Set<string>();
  const queue: string[] = [];

  for (const entry of [...GUIDE_ENTRIES, FALLBACK_ENTRY]) {
    for (const ref of entry.crossRefs ?? []) {
      found.add(ref);
      queue.push(ref);
    }
  }

  while (queue.length > 0) {
    const ref = queue.shift()!;
    const key = normalizeHeadword(ref);
    if (visited.has(key)) continue;
    visited.add(key);

    for (const next of getGuideEntryByTitle(ref)?.crossRefs ?? []) {
      found.add(next);
      queue.push(next);
    }
  }

  return [...found].sort();
}

describe('guide cross-references', () => {
  it('resolves every reachable headword', () => {
    const dead = reachableHeadwords().filter((ref) => !getGuideEntryByTitle(ref));
    expect(dead).toEqual([]);
  });

  it('reaches the whole set from the rooms alone', () => {
    // Guards against an entry becoming orphaned: nothing links to it any more.
    expect(reachableHeadwords().length).toBeGreaterThanOrEqual(40);
  });

  it('gives every entry a distinct id', () => {
    const ids = [...GUIDE_ENTRIES, FALLBACK_ENTRY].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('gives every reachable entry a verdict and a body', () => {
    for (const ref of reachableHeadwords()) {
      const entry = getGuideEntryByTitle(ref)!;
      expect(entry.verdict.length, ref).toBeGreaterThan(0);
      expect(entry.body.length, ref).toBeGreaterThan(0);
      expect(entry.body.join('').length, ref).toBeGreaterThan(20);
    }
  });

  it('keeps every topic entry out of room matching', async () => {
    const { getGuideEntry } = await import('@/lib/guideEntries');
    for (const ref of reachableHeadwords()) {
      const entry = getGuideEntryByTitle(ref)!;
      if (entry.aliases.length > 0) continue;
      // A room named after a topic must not select that topic entry.
      expect(getGuideEntry(entry.title).id, entry.title).not.toBe(entry.id);
    }
  });
});
