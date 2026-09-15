/**
 * Dry remarks for crossing a scoring threshold. The Guide's registrar of
 * achievement is not impressed, and says so.
 */

interface Milestone {
  at: number;
  remark: string;
}

const MILESTONES: Milestone[] = [
  { at: 1, remark: 'Your file has been opened. It will not be closed.' },
  { at: 25, remark: 'Progress noted, filed, and immediately mislaid.' },
  { at: 50, remark: 'A committee has been convened to consider your case.' },
  { at: 100, remark: 'You are now officially a going concern. Try not to dwell on it.' },
  { at: 150, remark: 'The committee has reconvened. Nothing has been decided.' },
  { at: 200, remark: 'Halfway. Statistically, this is where most hitchhikers give up.' },
  { at: 250, remark: 'Your persistence is being logged, which is not the same as admired.' },
  { at: 300, remark: 'The paperwork has begun to take you seriously.' },
  { at: 350, remark: 'Applications for your commemorative plaque are now being ignored.' },
  { at: 400, remark: 'Maximum bureaucracy achieved. There is nothing further to fill in.' },
];

/** Remarks for thresholds crossed by moving from `from` to `to`. */
export function milestonesCrossed(from: number, to: number): string[] {
  if (to <= from) return [];
  return MILESTONES.filter((m) => m.at > from && m.at <= to).map((m) => m.remark);
}
