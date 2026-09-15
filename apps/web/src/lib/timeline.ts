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
