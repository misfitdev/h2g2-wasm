/** The original game scores out of 400. */
export const MAX_SCORE = 400;

const BAR_WIDTH = 24;

/** ASCII only: the VT220 face has no block glyphs to draw a bar with. */
export function renderBar(score: number, max = MAX_SCORE, width = BAR_WIDTH): string {
  const safeMax = max > 0 ? max : 1;
  const ratio = Math.min(Math.max(score / safeMax, 0), 1);
  const filled = Math.round(ratio * width);
  return '='.repeat(filled) + '.'.repeat(width - filled);
}
