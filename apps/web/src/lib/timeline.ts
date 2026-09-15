/**
 * Turn tree for the Infinite Improbability Drive.
 *
 * Every completed turn becomes a node holding the Z-machine snapshot taken at
 * the following prompt, so jumping to a node restores exactly the state the
 * player would have been in. Running a command after jumping appends a new
 * child, which is what produces a branch rather than overwriting history.
 */

export interface TimelineNode {
  id: number;
  parentId: number | null;
  childIds: number[];
  /** null for the root, which is the state at the opening prompt. */
  command: string | null;
  snapshot: string;
  /** Transcript this turn produced, including the echoed command. */
  lines: string[];
  location: string;
  /** How many times the drive has landed here. Rarely-seen nodes are likelier. */
  visits: number;
}

export interface Timeline {
  nodes: Record<number, TimelineNode>;
  rootId: number | null;
  currentId: number | null;
  nextId: number;
}

export interface TurnInput {
  command: string | null;
  snapshot: string;
  lines: string[];
  location: string;
}

export function createTimeline(): Timeline {
  return { nodes: {}, rootId: null, currentId: null, nextId: 1 };
}

/** Appends a turn as a child of the current node, or seeds the root. */
export function appendTurn(timeline: Timeline, turn: TurnInput): Timeline {
  const id = timeline.nextId;
  const parentId = timeline.currentId;

  const node: TimelineNode = {
    id,
    parentId,
    childIds: [],
    command: turn.command,
    snapshot: turn.snapshot,
    lines: turn.lines,
    location: turn.location,
    visits: 0,
  };

  const nodes: Record<number, TimelineNode> = { ...timeline.nodes, [id]: node };
  if (parentId !== null && nodes[parentId]) {
    nodes[parentId] = {
      ...nodes[parentId],
      childIds: [...nodes[parentId].childIds, id],
    };
  }

  return {
    nodes,
    rootId: timeline.rootId ?? id,
    currentId: id,
    nextId: id + 1,
  };
}

export function setCurrent(timeline: Timeline, id: number): Timeline {
  if (!timeline.nodes[id]) return timeline;
  return { ...timeline, currentId: id };
}

/** Root-to-node path, oldest first. */
export function pathTo(timeline: Timeline, id: number): TimelineNode[] {
  const path: TimelineNode[] = [];
  let node = timeline.nodes[id];
  const guard = new Set<number>();

  while (node && !guard.has(node.id)) {
    guard.add(node.id);
    path.unshift(node);
    node = node.parentId === null ? undefined : timeline.nodes[node.parentId];
  }
  return path;
}

/** Full transcript for a node, rebuilt by replaying its ancestry. */
export function transcriptFor(timeline: Timeline, id: number): string[] {
  return pathTo(timeline, id).flatMap((node) => node.lines);
}

/** A node with more than one child is where the player diverged. */
export function isBranchPoint(timeline: Timeline, id: number): boolean {
  return (timeline.nodes[id]?.childIds.length ?? 0) > 1;
}

export interface TimelineRow {
  node: TimelineNode;
  depth: number;
  isCurrent: boolean;
  isBranchPoint: boolean;
  /** True when this node is on the path to the current node. */
  onCurrentPath: boolean;
}

/** Depth-first rows for display, oldest first. */
export function timelineRows(timeline: Timeline): TimelineRow[] {
  if (timeline.rootId === null) return [];

  const onPath = new Set(
    timeline.currentId === null ? [] : pathTo(timeline, timeline.currentId).map((n) => n.id)
  );

  const rows: TimelineRow[] = [];
  const walk = (id: number, depth: number) => {
    const node = timeline.nodes[id];
    if (!node) return;
    rows.push({
      node,
      depth,
      isCurrent: id === timeline.currentId,
      isBranchPoint: node.childIds.length > 1,
      onCurrentPath: onPath.has(id),
    });
    // A branch adds a level of indent; a straight run does not, or long
    // playthroughs would march off the right edge of the pane.
    const childDepth = node.childIds.length > 1 ? depth + 1 : depth;
    node.childIds.forEach((childId) => walk(childId, childDepth));
  };
  walk(timeline.rootId, 0);
  return rows;
}

export function recordVisit(timeline: Timeline, id: number): Timeline {
  const node = timeline.nodes[id];
  if (!node) return timeline;
  return {
    ...timeline,
    nodes: { ...timeline.nodes, [id]: { ...node, visits: node.visits + 1 } },
  };
}

/**
 * How improbable a destination is. Abandoned branches, unvisited turns and
 * deep forks score higher, so the drive favours where you did not go.
 */
function weightOf(timeline: Timeline, id: number, onPath: Set<number>): number {
  const node = timeline.nodes[id];
  if (!node) return 0;

  let weight = 1;
  if (!onPath.has(id)) weight += 3;
  if (node.visits === 0) weight += 2;
  weight += Math.min(pathTo(timeline, id).length - 1, 5) * 0.5;
  return weight;
}

function currentPathIds(timeline: Timeline): Set<number> {
  return new Set(
    timeline.currentId === null ? [] : pathTo(timeline, timeline.currentId).map((n) => n.id)
  );
}

/**
 * Picks a destination the player did not choose. `random` returns [0, 1) and is
 * injected so the selection can be tested.
 */
export function pickImprobableNode(
  timeline: Timeline,
  random: () => number
): number | null {
  const onPath = currentPathIds(timeline);
  const candidates = Object.values(timeline.nodes).filter((n) => n.id !== timeline.currentId);
  if (candidates.length === 0) return null;

  const weights = candidates.map((n) => weightOf(timeline, n.id, onPath));
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) return candidates[0].id;

  let roll = random() * total;
  for (let i = 0; i < candidates.length; i++) {
    roll -= weights[i];
    if (roll < 0) return candidates[i].id;
  }
  return candidates[candidates.length - 1].id;
}

/** Steps between two nodes via their nearest common ancestor. */
export function treeDistance(timeline: Timeline, fromId: number | null, toId: number): number {
  if (fromId === null) return pathTo(timeline, toId).length;

  const from = pathTo(timeline, fromId).map((n) => n.id);
  const to = pathTo(timeline, toId).map((n) => n.id);

  let shared = 0;
  while (shared < from.length && shared < to.length && from[shared] === to[shared]) shared++;

  return from.length - shared + (to.length - shared);
}

/**
 * The odds the drive quotes. Measures how far the destination is from where
 * you stand rather than how likely it was to be chosen: the drive is biased
 * toward long-odds destinations, so quoting selection probability would have
 * printed the shortest odds for the strangest places.
 */
export function improbabilityAgainst(timeline: Timeline, id: number): number {
  const node = timeline.nodes[id];
  if (!node) return 0;

  const distance = treeDistance(timeline, timeline.currentId, id);
  const unseen = node.visits === 0 ? 3 : 1;
  const base = Math.round((distance + 1) ** 3 * 111_111 * unseen);
  const jitter = (id * 2_654_435_761) % 999_983;
  return base + jitter;
}
