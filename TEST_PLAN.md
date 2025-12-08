# H2G2 WASM Game - Test Plan

## Overview

This document outlines the testing strategy for ensuring reliability and accessibility of the Hitchhiker's Guide to the Galaxy WASM game implementation.

## Current State

- **Game Engine**: Rust-based Z-machine emulator compiled to WASM
- **UI**: React terminal interface with semantic colors
- **Features**: Game loop, save/load, hint system, ASCII art
- **Stability Risk**: No automated tests currently; changes cause inconsistent crashes

## Critical Test Categories

### 1. WASM Initialization & Game State

**Why**: The "unreachable" panic errors indicate the game state becomes invalid during normal operation.

**Tests Needed**:
- [ ] `test_wasm_create()` - Verify game initializes without panic
- [ ] `test_wasm_step()` - Verify game loop executes 100+ steps without crashing
- [ ] `test_game_load_from_save()` - Verify save/load cycle preserves state
- [ ] `test_command_feed_sequence()` - Verify various command sequences work
- [ ] `test_memory_safety()` - Check for memory leaks after 1000+ steps

**Implementation Strategy**:
```rust
// encrusted/tests/integration_test.rs
#[test]
fn wasm_game_initialization() {
    let game = Game::new();
    assert!(!game.is_done());
}
```

### 2. Hint System

**Why**: New feature with complex JSON parsing and state management

**Tests Needed**:
- [ ] `test_hint_json_parsing()` - Verify invisiclues.json loads correctly
- [ ] `test_hint_location_matching()` - Verify hints match locations properly
- [ ] `test_hint_progressive_answers()` - Verify answer levels increment correctly
- [ ] `test_hint_system_no_crash()` - Ensure hint queries don't panic
- [ ] `test_empty_location_hints()` - Handle locations with no hints gracefully

**Implementation Strategy**:
```rust
// encrusted/tests/hint_test.rs
#[test]
fn hint_system_loads_json() {
    let hints = HintSystem::new();
    assert!(!hints.list_all_questions().is_empty());
}
```

### 3. WASM FFI Safety

**Why**: JavaScript-Rust boundary can cause panics if data is invalid

**Tests Needed**:
- [ ] `test_wasm_export_get_location()` - Verify returns valid string before init
- [ ] `test_wasm_export_get_hints()` - Verify returns valid JSON even with bad location
- [ ] `test_wasm_export_answer_bounds()` - Verify out-of-bounds access returns None
- [ ] `test_concurrent_wasm_calls()` - Verify thread-local state is safe

**Implementation Strategy**:
```typescript
// apps/web/tests/wasm.test.ts
describe('WASM Exports', () => {
  test('get_location returns string even before init', async () => {
    const module = await loadWasm();
    const location = module.get_location();
    expect(typeof location).toBe('string');
  });
});
```

### 4. React Component Reliability

**Why**: Modal crashes with undefined data, Terminal state management is fragile

**Tests Needed**:
- [ ] `test_hint_modal_opens()` - Modal appears when hint command sent
- [ ] `test_hint_modal_handles_no_questions()` - Graceful handling of empty question list
- [ ] `test_hint_modal_question_selection()` - Can select and view question
- [ ] `test_hint_modal_answer_progression()` - Timer-gated answer reveal works
- [ ] `test_terminal_command_interception()` - help/hint commands don't reach game
- [ ] `test_terminal_normal_commands()` - Other commands still work

**Implementation Strategy**:
```typescript
// apps/web/tests/HintModal.test.tsx
describe('HintModal', () => {
  test('renders without crashing with empty questions', () => {
    render(<HintModal isOpen={true} onClose={() => {}} location="bedroom" />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

### 5. Accessibility (WCAG 2.2 AA)

**Why**: No automated a11y checks currently

**Tests Needed**:
- [ ] `test_modal_focus_management()` - Focus trapped in modal when open
- [ ] `test_color_contrast()` - All text meets 4.5:1 or 7:1 minimum
- [ ] `test_keyboard_navigation()` - All interactive elements keyboard accessible
- [ ] `test_aria_labels()` - All buttons/regions have proper labels
- [ ] `test_escape_closes_modal()` - Escape key closes modal
- [ ] `test_semantic_html()` - Proper heading hierarchy and semantic elements

**Implementation Strategy**:
```typescript
// Use axe-core for automated accessibility testing
import { axe } from 'jest-axe';

test('HintModal meets WCAG AA', async () => {
  const { container } = render(<HintModal isOpen={true} onClose={() => {}} location="bedroom" />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

### 6. Save/Load State

**Why**: Critical feature, currently untested

**Tests Needed**:
- [ ] `test_save_creates_valid_data()` - Save returns non-empty base64 string
- [ ] `test_restore_from_save()` - Restore doesn't crash with valid save data
- [ ] `test_restore_invalid_data()` - Invalid save data handled gracefully
- [ ] `test_save_load_cycle_preserves_state()` - Game state identical after round-trip

### 7. Integration Tests (End-to-End)

**Why**: Catch interactions between systems

**Tests Needed**:
- [ ] `test_game_startup_to_first_hint()` - Full flow: load → play → type hint → see modal
- [ ] `test_game_with_save_load()` - Play → save → load → continue → hint
- [ ] `test_multiple_commands()` - Sequence of different commands without crash

## Test Implementation Roadmap

### Phase 1: Critical Stability (This Week)
1. Set up test infrastructure (vitest for TS, cargo test for Rust)
2. Add WASM initialization tests
3. Add hint system tests
4. Add React component tests

### Phase 2: Safety & Accessibility (Next Week)
1. Add WASM FFI safety tests
2. Add accessibility tests with axe-core
3. Add save/load tests

### Phase 3: Integration & Polish (Week 3)
1. Add end-to-end tests
2. Performance benchmarks
3. Memory leak detection

## Test Tools & Setup

### Rust (Encrusted Library)
```toml
[dev-dependencies]
wasm-bindgen-test = "1.3"

# Run tests: cargo test --lib
```

### TypeScript (Web App)
```bash
npm install -D vitest @testing-library/react @testing-library/user-event jest-axe

# Run tests: npm run test
```

## Success Criteria

✅ **Stability**: No "unreachable" panics during normal gameplay
✅ **Coverage**: >80% of critical paths have tests
✅ **Accessibility**: All WCAG 2.2 AA violations resolved
✅ **Reliability**: Modal works with all edge cases
✅ **Safety**: WASM FFI handles all invalid inputs gracefully

## Known Issues to Test

1. **Game crashes on certain input sequences** - Need to identify trigger commands
2. **Hint modal data access errors** - Partially fixed, needs full coverage
3. **Color contrast on some elements** - Fixed but needs validation
4. **Keyboard navigation not fully tested** - Added Escape support, need full testing

## Continuous Integration

Once tests are in place, add to CI/CD:
```yaml
test:
  - cargo test --release
  - npm run test
  - npm run lint
  - npm run build
```

---

**Status**: Test framework planned, implementation in progress
**Owner**: Development team
**Last Updated**: 2025-12-07
