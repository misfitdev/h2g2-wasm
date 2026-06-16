---
target: apps/web terminal game UI
total_score: 27
p0_count: 2
p1_count: 2
timestamp: 2026-06-16T02-28-06Z
slug: apps-web-src-components-terminal-tsx
---
# Critique: apps/web terminal game UI

Target: `apps/web/src/components/Terminal.tsx` and its children (TerminalControls, HintModal, SaveLoadDialog, DebugPanel) + global `index.css`.
Method: source review (Assessment A) + bundled deterministic detector (Assessment B). No browser/visual pass in this run.

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good aria-live log + loading/error lines; but nothing signals that controls or hints exist. |
| 2 | Match System / Real World | 4 | Terminal metaphor is a perfect fit for a text adventure. |
| 3 | User Control and Freedom | 3 | Undo/redo/save/load/history all exist; access to them is hidden. |
| 4 | Consistency and Standards | 2 | Broken focus styling, off-palette emerald green, invalid CSS, a stray Material shadow. |
| 5 | Error Prevention | 2 | Instant irreversible save-slot delete; empty input fed to engine; no guards. |
| 6 | Recognition Rather Than Recall | 2 | Controls are hover-only and auto-hide; player must recall hidden gestures. |
| 7 | Flexibility and Efficiency | 3 | Strong keyboard loop; no shortcut list; touch users underserved. |
| 8 | Aesthetic and Minimalist Design | 4 | Committed, distinctive CRT world. A couple of modern leaks. |
| 9 | Error Recovery | 2 | Terse dead-end failures; "Don't Panic" promise unmet at failure points. |
| 10 | Help and Documentation | 2 | Excellent Invisiclues hints, but undiscoverable; instructions scroll away. |
| **Total** | | **27/40** | **Good foundation, clear discoverability + correctness gaps** |

## Anti-Patterns Verdict

**Not AI slop.** This is a genuine, high-conviction VT220 phosphor aesthetic with a coherent point of view. It clears both category-reflex tiers: the obvious "terminal game = neon Matrix-green" reflex is avoided in favor of authentic CRT phosphor with amber/red reserved semantically. The only tells are modern defaults that leaked in, not genericness:
- A Material-style soft drop shadow (`box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1)`) on the HintModal.
- An emerald-400 `rgba(52,211,153,...)` hover/overlay in HintModal that is bluer than the phosphor `--terminal-green`.

**Deterministic scan:** 1 finding. `HintModal.module.css:260` animates `width` on the hint timer bar (layout thrash; use `transform: scaleX()`). Everything else the detector checks is clean.

## What's Working

1. **Aesthetic commitment.** A distinctive, coherent CRT world: layered phosphor glow, scanlines, curvature vignette, boot flicker, sharp corners, real VT220 bitmap font. Drenched monochrome-green with amber/red reserved for semantics. Disciplined and on-brand.
2. **Right metaphor, right loop.** The terminal is the perfect affordance for a text adventure (heuristic #2), and the keyboard loop (command history on up/down, Ctrl+L clear, persistent autofocus) matches how people actually play.
3. **Accessibility scaffolding.** sr-only input label, `aria-live` output log, aria-labels, and a documented WCAG-AA palette. A strong base that pays off as soon as the focus-visibility bug is fixed.

## Priority Issues

### [P0] Invisible keyboard focus
Focus styles across TerminalControls, SaveLoadDialog, and HintModal use `ring:` / `ring-offset:` (Tailwind utility names, not real CSS properties) alongside `outline: none`. Result: focused buttons, inputs, and save slots show no indicator at all.
- **Why it matters:** Keyboard and screen-reader users cannot tell where they are. Direct WCAG 2.4.7 failure on a keyboard-first product.
- **Fix:** Replace every `ring`/`ring-offset` block with a real ring, e.g. `outline: 2px solid hsl(var(--terminal-green)); outline-offset: 2px;`.
- **Suggested command:** /impeccable audit

### [P0] Controls are undiscoverable and broken on touch
Undo/redo/save/load/clear live in a top-edge toolbar that only appears on mouse hover and auto-hides after 2s. The only alternative is knowing to type `hint`/`help`. On touch devices there is no hover, so these features are effectively absent.
- **Why it matters:** First-timers never find save/undo; the boot-banner instructions scroll away. Mobile users get a game they apparently can't save or get hints in. This is the single biggest gap (drives heuristics #6, #7, #10).
- **Fix:** Add a persistent, quiet, on-brand affordance (a faint always-present corner glyph / `MENU` blink, or a pinned dim status strip) plus a real tap target on touch. Keep it period-correct.
- **Suggested command:** /impeccable onboard, then /impeccable adapt

### [P1] Invalid overlay / background CSS
`hsl(var(--terminal-black)) / 0.9` (SaveLoadDialog overlay) and `hsl(var(--terminal-black)) / 0.4` (TerminalControls toolbar + button) are invalid: the alpha must be inside the function (`hsl(var(--terminal-black) / 0.9)`).
- **Why it matters:** The save/load modal renders with no dim scrim, so it floats over live, still-readable game text. The control bar's translucent backdrop is dropped. Both read as visual bugs.
- **Fix:** Move alpha inside `hsl(...)`. Also `word-break: break-words` is not a valid value (use `overflow-wrap: break-word`).
- **Suggested command:** /impeccable audit

### [P1] "Don't Panic" not realized at failure points
Failures are terse dead-ends: `[Save failed]`, `[Load failed]`, `ERROR: ...`. Deleting a save slot is instant and irreversible with no confirmation.
- **Why it matters:** The product's core principle is calm recovery. Right now the worst moments (a failed save, a death, a lost slot) offer no next step and none of the brand voice.
- **Fix:** Rewrite failure copy with a calm next action and a wink; add a lightweight confirm or undo for slot deletion.
- **Suggested command:** /impeccable clarify, then /impeccable harden

### [P2] No reduced-motion fallback
Boot flicker, cursor blink, and transitions ignore `prefers-reduced-motion`. Any added CRT motion would compound this.
- **Why it matters:** Accessibility requirement; ambient flicker can be a problem for motion-sensitive users.
- **Fix:** Gate ambient motion behind `@media (prefers-reduced-motion: no-preference)`; keep a static-but-still-CRT look.
- **Suggested command:** /impeccable harden

### [P2] Off-palette color + layout-animated hint bar
HintModal uses emerald-400 `rgba(52,211,153,...)` instead of `--terminal-green`, and animates `width` on the timer bar.
- **Why it matters:** A second, bluer green breaks the monochrome discipline; animating width causes layout thrash.
- **Fix:** Use the token; animate with `transform: scaleX()`.
- **Suggested command:** /impeccable polish

## Persona Red Flags

**Jordan (First-Timer):** Lands in the terminal, plays a few commands, the intro scrolls away. Wants to save, sees nothing clickable, never discovers the hover toolbar, doesn't know to type `save`. Concludes the game can't be saved. On a phone, there are no controls at all.

**Alex (Power User):** Loves the keyboard loop (history, Ctrl+L, autofocus). Tabs into the save dialog and can't see focus (invisible ring), so navigation feels broken. Hunts for a shortcuts list, finds none. Mostly served, intermittently blind.

**The Returning Fan (project persona):** Replaying after years, hits a classic HHGG death, gets a terse failure with zero reassurance. The "Don't Panic" promise goes unmet at the precise moment it matters most.

## Questions to Consider

- What makes save/undo discoverable using zero modern chrome? A dim corner `MENU` that blinks once on idle? A persistent bottom status strip?
- Should save/restore be in-world terminal commands rather than modals, so the tool never leaves the fiction?
- What is the most "Don't Panic" possible death/failure screen?
