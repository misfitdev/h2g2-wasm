# Design

Visual system for the H2G2 terminal. Captured from the implemented code (`apps/web/src`). Colors are stored as raw HSL channel triplets in CSS custom properties and consumed via `hsl(var(--token))`, so alpha must be written *inside* the function: `hsl(var(--token) / 0.4)`.

## Theme

Single dark theme, non-negotiable: a green-phosphor CRT in a dark room. The scene that forces it: *a player at night, lights low, leaning into a glowing green monitor playing a 1982 text adventure.* There is no light mode and there should not be one. The "surface is the color" register is **Drenched**: the screen IS the green tube.

## Color

Strategy: **Drenched / Committed monochrome.** One hue (green, 120deg) carries the entire interface; amber and red are reserved strictly for status and error. This is a deliberate, high-conviction palette, not a restrained accent system.

Channel triplets (HSL), on pure-black background:

| Token | Value | Role |
|---|---|---|
| `--terminal-black` | `0 0% 0%` | Background (the unlit tube) |
| `--terminal-green` | `120 100% 35%` | Primary text (~7:1 on black) |
| `--terminal-green-dim` | `120 70% 25%` | Secondary / disabled text (~4.5:1) |
| `--terminal-green-light` | `120 100% 45%` | Emphasis, hover |
| `--terminal-green-glow` | `120 100% 50%` | Glow only, never text fill |
| `--terminal-amber` / `-light` | `36 100% 40/50%` | Status indicators (debug, warnings) |
| `--terminal-red` / `-light` | `0 100% 40/50%` | Errors, destructive (delete) |
| `--border` | `120 40% 20%` | Dim green hairlines |

Rules:
- Stay inside this palette. Do not introduce off-hue greens.
- Amber and red are semantic only, never decoration.
- Migration note: tokens are HSL-channel format today. If the project later moves to OKLCH, keep the same roles; do not change the look.

## Typography

- **One family, monospace, period-correct:** `'Glass TTY VT220'` (a real VT220 bitmap face), falling back to `Monaco, Consolas, 'Courier New', monospace`.
- Terminal body is **20px**, weight 500, `letter-spacing: 0.05em`, with `-webkit-font-smoothing: none` and `font-feature-settings: 'liga' 0` to keep the crisp pixel look. Do not anti-alias the terminal text; the harshness is the point.
- UI chrome (modals, controls) runs smaller: 11px to 18px. This is a tool, so a tight scale is fine; hierarchy comes from weight (bold for room names / titles) and the dim-vs-bright green split, not from a dramatic type ramp.
- Output semantics via spans: `.room` (bold bright green), `.object` (dim green), `.debug` (amber), `pre.ascii-art` (preserved whitespace, bright green).

## Effects (the signature layer)

This is what makes it a CRT rather than a dark webpage. Treat these as first-class design tokens:

- **Phosphor glow:** layered `text-shadow` (1px/2px/4px greens at decreasing alpha) on all lit text. `--glow-intensity: 0 0 10px`.
- **Scanlines:** `repeating-linear-gradient` every 4px, `--scanline-opacity: 0.03` (currently very faint, room to push).
- **Curvature vignette:** `.crt-effect::after` radial gradient darkening the corners.
- **Boot flicker:** a 0.5s opacity flicker on load (`@keyframes flicker`).
- **Cursor blink:** 1s step-end blink.
- Sharp corners everywhere: `--radius: 0`. Keep it. Rounded corners read as modern and break the era.
- All of the above gate on `prefers-reduced-motion` and degrade to a static-but-still-CRT look.

## Components

Custom, hand-built (no component library chrome). Every interactive element needs the full state set:

- **Buttons / controls:** transparent background, dim-green default, bright-green + glow on hover. Sharp corners, hairline borders. Focus is a real visible ring (`outline: 2px solid hsl(var(--terminal-green)); outline-offset: 2px`) on every control.
- **Control bar (`TerminalControls`):** top-edge toolbar, hover-revealed, auto-hides after 2s. Backdrop blur.
- **Modals (`SaveLoadDialog`, `HintModal`):** centered or top-right panels, 1-2px green borders, black fill. The save/load overlay dims behind the modal (`hsl(var(--terminal-black) / 0.9)`); the hint modal uses a green glow (`box-shadow: 0 0 20px hsl(var(--terminal-green) / 0.25)`), not a drop shadow.
- **Inputs:** transparent, glowing green text, dim-green placeholder, border brightens on focus.
- **`Terminal`:** the root shell — owns game state, output log, and command input; composes every other component below it.
- **`CRTScreen`:** decorative, pointer-events-none overlay (scanlines, beam, vignette, chromatic aberration, boot-flicker) layered above terminal text but below modals.
- **`Splash`:** full-screen title screen rendered as a `role="dialog"`; draws the boot art to a canvas at native resolution and scales via CSS.
- **`ScoreMeter`:** a `role="status"` strip showing current location, score bar, and turn count.
- **`GuidePane`:** a slide-out aside (the in-fiction "Guide") with a hover/tap handle, cross-referenced entries, and its own flicker transition on entry swap.
- **`ImprobabilityDrive`:** a slide-out aside listing the turn timeline, with manual-override jump and a randomized "engage" action.
- **`DebugPanel`:** a fixed bottom-right readout (location, git hash, WASM checksum, seed), toggled by `?debug=1`.

## Layout

- Full-viewport fixed terminal, `overflow: hidden`. Output area scrolls; input is pinned to the bottom with a soft green floor-glow gradient and a hairline top border.
- Debug panel pinned bottom-right, fixed-px columns, amber/dim-green, toggled by `?debug=1`.
- Spacing scale: 0.25 / 0.5 / 0.75 / 1 / 1.5 rem.
- Responsive behavior is mostly absent: hint modal is a hardcoded 500x300, controls are hover-only. Mobile needs structural (not fluid-type) attention.

## Motion

- Transitions 150-250ms, `cubic-bezier(0.4,0,0.2,1)`. Fine for chrome.
- Motion should convey state (control bar in/out, focus, reveal), plus the deliberate ambient CRT life (flicker, blink, scanline). Ambient motion is the one place this product is *allowed* decorative motion, because it serves immersion, but it must respect reduced-motion.
- Avoid animating layout properties. (Debt: `HintModal` animates `width` on the hint timer bar; use `transform: scaleX()`.)
