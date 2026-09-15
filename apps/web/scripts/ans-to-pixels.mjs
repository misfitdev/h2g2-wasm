/**
 * Converts half-block ANSI art into a palette + index grid.
 *
 * Each cell is U+2580 (upper half block): the foreground colour paints the
 * top pixel, the background colour the bottom one. Rendering the source as
 * text is not an option here because the terminal face has no block glyphs,
 * so it is decoded to pixels and drawn to a canvas instead.
 *
 * Usage: node scripts/ans-to-pixels.mjs <in.ans> <out.ts>
 */
import { readFileSync, writeFileSync } from 'node:fs';

const [, , inPath, outPath] = process.argv;
const src = readFileSync(inPath, 'utf8');

const SGR = /\x1b\[([0-9;]*)m/g;
const rows = src.split('\n').filter((line) => line.includes('▀'));

const palette = [];
const indexOf = (rgb) => {
  const key = rgb.join(',');
  let i = palette.indexOf(key);
  if (i === -1) { palette.push(key); i = palette.length - 1; }
  return i;
};

const grid = [];
for (const line of rows) {
  const top = [];
  const bottom = [];
  let fg = [0, 0, 0];
  let bg = [0, 0, 0];
  let pos = 0;

  const emit = (text) => {
    for (const ch of text) {
      if (ch !== '▀') continue;
      top.push(indexOf(fg));
      bottom.push(indexOf(bg));
    }
  };

  SGR.lastIndex = 0;
  let m;
  while ((m = SGR.exec(line)) !== null) {
    emit(line.slice(pos, m.index));
    const codes = m[1].split(';');
    for (let i = 0; i < codes.length; ) {
      if (codes[i] === '38' && codes[i + 1] === '2') { fg = codes.slice(i + 2, i + 5).map(Number); i += 5; }
      else if (codes[i] === '48' && codes[i + 1] === '2') { bg = codes.slice(i + 2, i + 5).map(Number); i += 5; }
      else if (codes[i] === '0' || codes[i] === '') { fg = [0, 0, 0]; bg = [0, 0, 0]; i += 1; }
      else i += 1;
    }
    pos = m.index + m[0].length;
  }
  emit(line.slice(pos));

  grid.push(top, bottom);
}

const width = grid[0].length;
if (grid.some((r) => r.length !== width)) throw new Error('ragged rows');
if (palette.length > 75) throw new Error(`palette too large for the ASCII packing: ${palette.length}`);

// One printable ASCII char per pixel, offset past the quote and backslash range.
const pixels = grid.map((row) => row.map((i) => String.fromCharCode(i + 48)).join('')).join('');

writeFileSync(outPath, `/**
 * Heart of Gold splash art, decoded from src/assets/heart-of-gold-terminal.ans.
 * Regenerate with: node scripts/ans-to-pixels.mjs <in.ans> <out.ts>
 */

export const HEART_OF_GOLD = {
  width: ${width},
  height: ${grid.length},
  /** 'r,g,b' strings, indexed by the characters in \`pixels\`. */
  palette: ${JSON.stringify(palette)},
  /** One character per pixel, row-major; palette index is charCode - 48. */
  pixels: ${JSON.stringify(pixels)},
} as const;
`);

console.log(`${width}x${grid.length}, ${palette.length} colours, ${pixels.length} px`);
