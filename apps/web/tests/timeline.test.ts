import { describe, it, expect } from 'vitest';
import {
  createTimeline,
  appendTurn,
  setCurrent,
  pathTo,
  transcriptFor,
  isBranchPoint,
  timelineRows,
  pickImprobableNode,
  improbabilityAgainst,
  recordVisit,
  treeDistance,
  type Timeline,
} from '@/lib/timeline';

const turn = (command: string | null, lines: string[], location = 'Bedroom') => ({
  command,
  snapshot: `snap:${command ?? 'root'}`,
  lines,
  location,
});

/** Root -> a -> b, then jump back to a and diverge into c. */
const forked = (): Timeline => {
  let t = createTimeline();
  t = appendTurn(t, turn(null, ['You wake up.']));
  const rootId = t.currentId!;
  t = appendTurn(t, turn('turn on light', ['> turn on light', 'The light is now on.']));
  const aId = t.currentId!;
  t = appendTurn(t, turn('get up', ['> get up', 'Very difficult.']));
  t = setCurrent(t, aId);
  t = appendTurn(t, turn('sleep', ['> sleep', 'You sleep.']));
  return { ...t, nodes: t.nodes, rootId, nextId: t.nextId };
};

describe('timeline', () => {
  it('starts empty', () => {
    const t = createTimeline();
    expect(t.rootId).toBeNull();
    expect(t.currentId).toBeNull();
    expect(timelineRows(t)).toEqual([]);
  });

  it('seeds the root from the first turn', () => {
    const t = appendTurn(createTimeline(), turn(null, ['You wake up.']));
    expect(t.rootId).toBe(t.currentId);
    expect(t.nodes[t.rootId!].parentId).toBeNull();
  });

  it('appends later turns as children of the current node', () => {
    let t = appendTurn(createTimeline(), turn(null, ['boot']));
    const rootId = t.currentId!;
    t = appendTurn(t, turn('look', ['> look']));
    expect(t.nodes[t.currentId!].parentId).toBe(rootId);
    expect(t.nodes[rootId].childIds).toEqual([t.currentId]);
  });

  it('branches when a command follows a jump', () => {
    const t = forked();
    const rootChild = t.nodes[t.rootId!].childIds[0];
    expect(t.nodes[rootChild].childIds).toHaveLength(2);
    expect(isBranchPoint(t, rootChild)).toBe(true);
  });

  it('does not mutate the previous timeline', () => {
    const before = appendTurn(createTimeline(), turn(null, ['boot']));
    const snapshot = JSON.stringify(before);
    appendTurn(before, turn('look', ['> look']));
    expect(JSON.stringify(before)).toBe(snapshot);
  });

  it('rebuilds a transcript from the ancestry', () => {
    const t = forked();
    expect(transcriptFor(t, t.currentId!)).toEqual([
      'You wake up.',
      '> turn on light',
      'The light is now on.',
      '> sleep',
      'You sleep.',
    ]);
  });

  it('keeps sibling branches out of each other transcripts', () => {
    const t = forked();
    const branchPoint = t.nodes[t.rootId!].childIds[0];
    const [firstChild] = t.nodes[branchPoint].childIds;
    expect(transcriptFor(t, firstChild)).toContain('> get up');
    expect(transcriptFor(t, firstChild)).not.toContain('> sleep');
    expect(transcriptFor(t, t.currentId!)).not.toContain('> get up');
  });

  it('orders the path oldest first', () => {
    const t = forked();
    expect(pathTo(t, t.currentId!).map((n) => n.command)).toEqual([null, 'turn on light', 'sleep']);
  });

  it('ignores a jump to an unknown node', () => {
    const t = forked();
    expect(setCurrent(t, 999)).toBe(t);
  });

  it('marks the current node and its ancestry', () => {
    const t = forked();
    const rows = timelineRows(t);
    expect(rows.filter((r) => r.isCurrent)).toHaveLength(1);
    expect(rows.find((r) => r.isCurrent)!.node.command).toBe('sleep');
    const offPath = rows.find((r) => r.node.command === 'get up')!;
    expect(offPath.onCurrentPath).toBe(false);
  });

  it('indents only at branch points', () => {
    const t = forked();
    const rows = timelineRows(t);
    // root and its only child stay at depth 0; the two siblings indent.
    expect(rows.find((r) => r.node.command === null)!.depth).toBe(0);
    expect(rows.find((r) => r.node.command === 'turn on light')!.depth).toBe(0);
    expect(rows.find((r) => r.node.command === 'get up')!.depth).toBe(1);
    expect(rows.find((r) => r.node.command === 'sleep')!.depth).toBe(1);
  });

  it('lists every node exactly once', () => {
    const t = forked();
    const ids = timelineRows(t).map((r) => r.node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(Object.keys(t.nodes).length);
  });
});

describe('improbability', () => {
  it('never picks the node you are already on', () => {
    const t = forked();
    for (const r of [0, 0.25, 0.5, 0.75, 0.999]) {
      expect(pickImprobableNode(t, () => r)).not.toBe(t.currentId);
    }
  });

  it('returns null when there is nowhere else to go', () => {
    const t = appendTurn(createTimeline(), turn(null, ['boot']));
    expect(pickImprobableNode(t, () => 0.5)).toBeNull();
  });

  it('only ever picks real nodes', () => {
    const t = forked();
    for (let i = 0; i < 50; i++) {
      const id = pickImprobableNode(t, () => i / 50)!;
      expect(t.nodes[id]).toBeDefined();
    }
  });

  it('can reach every candidate across the roll range', () => {
    const t = forked();
    const seen = new Set<number>();
    for (let i = 0; i < 200; i++) seen.add(pickImprobableNode(t, () => i / 200)!);
    expect(seen.size).toBe(Object.keys(t.nodes).length - 1);
  });

  it('quotes longer odds for a further destination', () => {
    const t = forked();
    const parent = Object.values(t.nodes).find((n) => n.command === 'turn on light')!;
    const sibling = Object.values(t.nodes).find((n) => n.command === 'get up')!;
    // 'turn on light' is one step up; 'get up' is up one and down one.
    expect(treeDistance(t, t.currentId, sibling.id)).toBeGreaterThan(
      treeDistance(t, t.currentId, parent.id)
    );
    expect(improbabilityAgainst(t, sibling.id)).toBeGreaterThan(
      improbabilityAgainst(t, parent.id)
    );
  });

  it('counts visits so a revisited node becomes less improbable', () => {
    const t = forked();
    const target = Object.values(t.nodes).find((n) => n.command === 'get up')!;
    const before = improbabilityAgainst(t, target.id);
    const after = improbabilityAgainst(recordVisit(t, target.id), target.id);
    expect(after).toBeLessThan(before);
  });

  it('measures distance as zero to yourself', () => {
    const t = forked();
    expect(treeDistance(t, t.currentId, t.currentId!)).toBe(0);
  });

  it('quotes stable odds for the same destination', () => {
    const t = forked();
    const id = t.nodes[t.rootId!].childIds[0];
    expect(improbabilityAgainst(t, id)).toBe(improbabilityAgainst(t, id));
  });
});
