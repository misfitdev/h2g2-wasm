# Product

## Register

product

## Users

Players of the classic Infocom *Hitchhiker's Guide to the Galaxy* text adventure, reached through three overlapping audiences:

- **Fans of the original game / Douglas Adams** replaying a notoriously hard, funny adventure.
- **Retro-computing enthusiasts** who want the CRT-terminal feel, not just the text.
- **Developers** curious about the Rust + WebAssembly + React stack behind it.

Context of use: a single full-screen terminal in a browser, mostly on desktop with a keyboard, sometimes on a phone. The job to be done is *play (or replay) the game and stay unstuck* without breaking the period illusion: type commands, get hints when wedged, save/undo when a puzzle goes wrong.

## Product Purpose

A faithful web port of the HHGG Z-machine game wrapped in an authentic VT220 terminal. The engine runs in Rust/WASM; the UI is a CRT emulator. Success is two things at once: a player believes they are sitting at a 1980s green-phosphor terminal, *and* they never rage-quit because they got stuck or lost progress. Modern conveniences (save slots, undo/redo, progressive hints from the original Invisiclues) exist to keep people playing a deliberately punishing game, delivered so they don't shatter the era.

## Brand Personality

Adamsesque: witty, dry, faintly absurd. The guiding maxim is **"Don't Panic"**, which shapes how the interface behaves at failure points more than how it decorates. Three words: *witty, authentic, unflappable*. Emotional goals: nostalgic delight, playful challenge, and calm reassurance exactly when the player fails, dies, or gets lost. Copy has a voice, but the voice never blocks play.

## Anti-references

- Modern flat SaaS chrome (rounded cards, drop shadows, Inter, a settings-panel feel). This is the dominant failure mode to avoid; a few modern defaults have already leaked in (Material drop shadow on the hint modal, an emerald-400 hover tint that is not the phosphor green).
- "Hacker movie" neon cyber aesthetic, Matrix rain, glitch-for-glitch's-sake.
- Skeuomorphic glossy monitor bezels and glassmorphism.
- Gamification cliches: XP bars, confetti, achievement toasts, streaks.

## Design Principles

1. **Immersion first.** When period authenticity and a modern UI convention conflict, authenticity wins, as long as the player can still find what they need.
2. **Don't Panic.** Every error, death, dead-end, or failed action offers a calm, obvious way forward (undo, retry, a hint), never just a wall.
3. **The tool disappears, but stays findable.** Controls should be quiet during play and unmistakable the moment a player looks for them. Quiet is not the same as hidden.
4. **Earn the era.** CRT effects must read as a real cathode-ray tube (bloom, scanline, curvature, warm-up) rather than as generic decoration. If an effect doesn't make the screen feel more like hardware, cut it.
5. **One voice, never in the way.** Witty framing in copy is welcome; it must never add a click or hide an action behind a joke.

## Accessibility & Inclusion

- Target **WCAG AA**. The phosphor palette is already tuned for it (primary green ~7:1, dim ~4.5:1 on black); keep new colors inside that system rather than introducing off-palette greens.
- **Keyboard-first.** It is a terminal; every action must be reachable and *visibly* focusable from the keyboard. Focus indicators must be real (current code relies on a non-existent `ring` property, so focus is invisible: fix before anything else).
- **Respect `prefers-reduced-motion`.** The CRT flicker, cursor blink, scanline motion, and any boot sequence need a calm static fallback that still looks like a powered-on terminal.
- **Screen-reader path.** Game output is an `aria-live` log; preserve that, and make sure modal/hint content moves focus correctly and is announced.
- **Touch reality.** Hover is not available on phones; any affordance that only appears on hover is effectively missing for touch users.
