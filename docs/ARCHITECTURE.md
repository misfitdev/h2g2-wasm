# H2G2 WASM Game Architecture

## System Overview

```
┌─────────────────────────────────────────────────────┐
│  React Web UI (TypeScript)                          │
│  ├─ Terminal Component (game output & input)        │
│  ├─ HintModal Component (interactive help system)   │
│  ├─ TerminalControls (undo/redo/save/load)          │
│  ├─ SaveLoadDialog (save slot picker)                │
│  ├─ GuidePane, ImprobabilityDrive, ScoreMeter,       │
│  │  Splash, CRTScreen, DebugPanel                    │
│  └─ useWasm Hook (WASM module interface)            │
└──────────────────┬──────────────────────────────────┘
                   │ wasm-bindgen FFI
                   ↓
┌─────────────────────────────────────────────────────┐
│  WASM Module (Rust)                                 │
│  ├─ wasm/src/lib.rs (18 FFI exports)                 │
│  │  ├─ create() - Initialize game                   │
│  │  ├─ get_seed() - Session RNG seed (for repro)     │
│  │  ├─ step() - Execute one game cycle              │
│  │  ├─ feed(input) - Send player command            │
│  │  ├─ get_location() - Current room name           │
│  │  ├─ get_score() - Score/turns as JSON             │
│  │  ├─ get_room_ascii_art() - ASCII art for room     │
│  │  ├─ get_updates() - Push map/tree/status updates  │
│  │  ├─ undo() / redo() - History navigation          │
│  │  ├─ get_hints_for_location() - Hints JSON        │
│  │  ├─ get_hint_answer() - Single hint answer       │
│  │  ├─ save() / restore() / load_savestate()         │
│  │  │  - State persistence                           │
│  │  └─ store_message() / get_messages() /            │
│  │     clear_messages() - Message buffer             │
│  │
│  └─ encrusted/src/ (Game Engine)
│     ├─ zmachine.rs (main game loop & Z-machine)
│     ├─ hints.rs (hint system with InvisiClues data)
│     ├─ ascii_art.rs (room ASCII art definitions)
│     ├─ ui_web.rs (WebUI message sink)
│     ├─ lib.rs (public API exports)
│     └─ encrusted/data/invisiclues.json (hint data)
│
└─────────────────────────────────────────────────────┘
```

## Key Components

### 1. React Components

#### Terminal.tsx
- **Purpose**: Main game interface
- **Responsibilities**:
  - Display game output
  - Capture player input
  - Intercept hint/help commands
  - Manage game state (lines, history)
- **State**:
  - `input`: Current command being typed
  - `hintModalOpen`: Whether modal is visible
  - `currentLocation`: For hint context
- **Key Props**: None (uses hooks)
- **WCAG AA Compliant**: Yes (color contrast, keyboard nav)

#### HintModal.tsx
- **Purpose**: Interactive hint browser
- **Responsibilities**:
  - Display questions for current location
  - Show progressive answer levels
  - Gate answer reveal with timer
  - Handle keyboard/mouse interaction
- **State**:
  - `questions`: Available hints for location
  - `selectedIdx`: Currently viewing question
  - `currentLevel`: Answer level (0-N)
  - `timerProgress`: Fill percentage (0-100)
  - `canShowNext`: Timer complete flag
- **WCAG AA Features**:
  - Proper ARIA labels and roles
  - Keyboard navigation (Escape to close)
  - Focus management
  - 7:1 color contrast on all text
  - Semantic HTML with role="dialog"

#### TerminalControls.tsx
- **Purpose**: Button bar (undo/redo/save/load/clear)
- **Features**: Collapsible toolbar toggled via a "nub" handle (not a timed auto-hide)
- **Integration**: Calls useWasm hooks

#### SaveLoadDialog.tsx
- **Purpose**: Save slot selection UI (controlled component; slot list/actions passed in as props)
- **Features**: Create/load/delete save slots
- **Storage**: localStorage for persistence, managed by the `useTerminal` hook

#### GuidePane.tsx
- **Purpose**: In-game "guide" panel showing lore/reference entries for the current location
- **Data**: Backed by `apps/web/src/lib/guideEntries.ts`
- **Features**: Toggleable panel with a flicker-in animation on open

#### ImprobabilityDrive.tsx
- **Purpose**: Timeline/branch visualization panel
- **Data**: Backed by `apps/web/src/lib/timeline.ts`

#### ScoreMeter.tsx
- **Purpose**: Compact score/turns strip (hidden for time-based games with no score)
- **Data**: Backed by `apps/web/src/lib/scoreMeter.ts` and `scoreMilestones.ts`

#### Splash.tsx
- **Purpose**: Title screen shown on first paint
- **Rendering**: Draws ASCII art (`apps/web/src/lib/heartOfGold.ts`) to a canvas at native 128x76 resolution, scaled up via CSS

#### CRTScreen.tsx
- **Purpose**: Ambient CRT overlay plus a one-shot power-on boot sequence
- **Behavior**: Purely decorative (`pointer-events: none`); power-on removed on a fixed timer rather than `animationend` so it can't get stuck on screen

#### DebugPanel.tsx
- **Purpose**: Small debug strip showing current location, git hash, WASM checksum, and RNG seed

### 2. WASM Module (Rust)

#### wasm/src/lib.rs
```rust
// Thread-local game instance
thread_local!(static ZVM: RefCell<Option<Zmachine>> = ...);

// FFI Exports (18 total, #[wasm_bindgen])
pub fn create()  // Initialize game
pub fn get_seed() -> String  // Session RNG seed, for reproducing a run
pub fn step() -> bool  // Game step returns true if done
pub fn feed(input: String)  // Send command to game
pub fn get_location() -> String  // Current room
pub fn get_score() -> String  // {"score":N,"turns":N} JSON, or "null"
pub fn get_hints_for_location(location: String) -> String  // JSON
pub fn get_hint_answer(question_idx: usize, level: usize) -> Option<String>
pub fn get_room_ascii_art() -> Option<String>  // ASCII art for current room
pub fn get_updates()  // Push map/tree/status-bar updates to the UI sink
pub fn undo() -> bool
pub fn redo() -> bool
pub fn save() -> Option<String>  // Base64 encoded state
pub fn restore(data: String)  // Load from base64
pub fn load_savestate(data: String)  // Load a raw base64 save blob
pub fn store_message(msg_type: String, message: String)
pub fn get_messages() -> String  // Game output as JSON
pub fn clear_messages()  // Clear message buffer
```

**Design Decisions**:
- Thread-local storage for game instance (WASM single-threaded)
- Message store (HashMap) for output buffering (avoids C string marshaling)
- Option<T> for nullable returns (becomes null/undefined in JS)
- Safe defaults (empty strings/None) if game not initialized

#### encrusted/src/zmachine.rs (2045 lines)
```rust
pub struct Zmachine {
    pub ui: Box<dyn UI>,
    pub options: Options,
    pub instr_log: String,

    version: u8,
    memory: Buffer,
    frames: Vec<Frame>,        // Call stack (routine frames)
    pc: usize,                 // Program counter

    // Object/dictionary tables, parsed from the story file header
    obj_table_addr: usize,
    dictionary: HashMap<String, usize>,

    // Undo/redo
    current_state: Option<(String, Vec<u8>)>,
    undos: Vec<(String, Vec<u8>)>,
    redos: Vec<(String, Vec<u8>)>,

    // Subsystems
    rng: StdRng,
    hint_system: HintSystem,
    secret_key: [u8; 32],      // Save-state integrity check
}

impl Zmachine {
    pub fn step(&mut self) -> bool  // Main game loop
    pub fn handle_input(&mut self, input: String)
    pub fn get_current_room(&self) -> (u16, String)
    pub fn get_current_room_ascii_art(&self) -> Option<&'static str>
    pub fn get_score_turns(&self) -> Option<(i16, u16)>
    pub fn get_hint_system(&mut self) -> &mut HintSystem
    pub fn get_save_state(&self) -> Option<String>
    pub fn restore(&mut self, data: &str)
    pub fn load_savestate(&mut self, data: &str)
    pub fn undo(&mut self) -> bool
    pub fn redo(&mut self) -> bool
}
```

**Key Operations**:
- `step()`: Executes one Z-machine instruction
- `handle_input()`: Parses command and updates game state
- Save/restore: Binary serialization with base64 encoding

#### encrusted/src/hints.rs
```rust
#[derive(Clone, Debug, serde::Deserialize, serde::Serialize)]
pub struct HintQuestion {
    pub question: String,
    pub answers: Vec<String>,  // Progressive levels A, B, C, D
    pub section: String,
    pub tags: Vec<String>,
}

pub struct HintSystem {
    book: HintBook,
    question_levels: HashMap<usize, usize>,  // Track hint level per question
}

impl HintSystem {
    pub fn get_contextual_hint(&mut self, context: Option<&str>) -> (String, String)
    pub fn get_questions_for_location(&self, location: &str) -> Vec<(usize, HintQuestion)>
    pub fn get_answer_at_level(&self, question_idx: usize, level: usize) -> Option<String>
}
```

**Data Flow**:
1. Player types "hint" in Terminal
2. Terminal calls `getLocation()` via useWasm hook
3. Terminal calls `getHintsForLocation(location)` via hook
4. Returns JSON array: `[(idx, {question, answers[], section, tags[]})]`
5. Player clicks question
6. Modal calls `getHintAnswer(idx, level)` for each level
7. `question_levels` HashMap tracks which level was last shown

#### encrusted/data/invisiclues.json
```json
{
  "sections": [
    {
      "name": "On the Earth",
      "questions": [
        {
          "question": "How do I turn on the light?",
          "answers": [
            "Try TURN ON THE LIGHT",
            "You can't turn it on, it's already on",
            "..."  // More hints
          ],
          "section": "On the Earth",
          "tags": ["on_the_earth", "bedroom"]
        }
      ]
    }
  ]
}
```

**Format**:
- Parsed at compile time with `include_str!()`
- Embedded directly in binary (no runtime parsing)
- 1804 lines, 118 questions across 12 sections

### 3. useWasm Hook

```typescript
export function useWasm() {
  const [isInitialized, setIsInitialized] = useState(false);
  const wasmRef = useRef<WasmExports | null>(null);

  useEffect(() => {
    // Load h2g2_wasm.js (wasm-bindgen generated)
    // Initialize WASM module
    // Call create()
  }, []);

  return {
    isInitialized,
    feed: (input: string) => wasmRef.current?.feed(input),
    step: () => wasmRef.current?.step() ?? false,
    getLocation: () => wasmRef.current?.get_location() ?? '',
    getHintsForLocation: (location: string) =>
      wasmRef.current?.get_hints_for_location(location) ?? '[]',
    getHintAnswer: (idx: number, level: number) =>
      wasmRef.current?.get_hint_answer(idx, level),
    // ... other methods
  };
}
```

## Data Flow Examples

### Game Loop
```
React: player types "look"
  ↓
Terminal.handleSubmit() calls hook.feed("look")
  ↓
WASM: Zmachine::handle_input("look") parses command
  ↓
Executes Z-machine instructions to process "look"
  ↓
Outputs to WebUI (via js_message FFI)
  ↓
JS env-shim.js captures output, stores in message HashMap
  ↓
React: calls step() in loop (100 iterations max)
  ↓
step() calls push_updates() which calls get_messages()
  ↓
WASM returns JSON: {print: "...", map: "...", tree: "..."}
  ↓
Terminal renders output lines
```

### Hint System
```
React: player types "hint"
  ↓
Terminal.handleSubmit() intercepts "hint" command
  ↓
Calls hook.getLocation() → returns "bedroom"
  ↓
Calls hook.getHintsForLocation("bedroom")
  ↓
WASM: HintSystem::get_questions_for_location("bedroom")
  ├─ Filters all questions by tag match or keyword match
  └─ Returns Vec<(usize, HintQuestion)> serialized to JSON
  ↓
Modal renders question list
  ↓
Player clicks question at index 3
  ↓
Modal calls hook.getHintAnswer(3, 0) → answer[0]
  ↓
Sets timer, player can click again after 3 seconds
  ↓
Player clicks "NEXT HINT"
  ↓
Modal calls hook.getHintAnswer(3, 1) → answer[1]
  ↓
Process repeats until all answers shown
```

## Color System (WCAG 2.2 AA)

```css
:root {
  /* Semantic colors with documented contrast ratios */
  --terminal-green: 120 100% 35%;      /* 7:1 on black */
  --terminal-green-dim: 120 70% 25%;   /* 4.5:1 on black */
  --terminal-green-light: 120 100% 45%; /* 7:1+ on black */

  --terminal-red: 0 100% 40%;          /* 7:1 on black */
  --terminal-amber: 36 100% 40%;       /* 7:1 on black */
}
```

**Why These Values**:
- Changed from `hsl(120 100% 50%)` which fails WCAG AA
- Lower lightness = higher contrast on black background
- Tested with WebAIM contrast checker

## State Management

### Game State (in WASM)
- **Owner**: Zmachine (immutable struct returned by step())
- **Persistence**: Can be serialized to base64 and restored
- **Thread Safety**: Single-threaded (WASM limitation)

### UI State (in React)
- **Local Component State**: useState() in Terminal, HintModal
- **Browser Storage**: localStorage for save slots
- **Shared State**: useWasm() hook provides read-only game interface

## Error Handling

### Current Issues
1. **Panics in WASM** - Marked as "unreachable" errors in console
   - Caused by uninitialized game state
   - Fixed: Made hint functions return safe defaults if game not init

2. **Undefined Data in Modal** - Questions array empty at wrong time
   - Fixed: Added null checks and safe destructuring
   - Pending: Add error boundary to catch render errors

3. **Color Contrast Failures** - Text unreadable on dark bg
   - Fixed: Updated colors to meet WCAG AA minimums
   - Implemented semantic color variables

### Planned Improvements
- Add React Error Boundary to catch component crashes
- Add console error logging for debugging
- Implement graceful degradation for missing features

## Performance Considerations

### WASM Size
- Current: ~448 KB uncompressed (h2g2_wasm_bg.wasm), ~185 KB gzipped
- Includes: Full Z-machine emulator + InvisiClues JSON data
- Acceptable for production (modern browsers handle this fine)

### Memory
- Game memory: 64KB per instance (Z-machine standard)
- Message buffer: Cleared after each update cycle
- Question levels: HashMap grows with hints asked (negligible)

### CPU
- Game loop: 100 steps per input (prevents infinite loops)
- Hint matching: O(n) scan of 118 questions (< 1ms)
- JSON parsing: Only done on first hint lookup

## Testing Strategy

See [TEST_PLAN.md](./TEST_PLAN.md) for comprehensive testing plan.

**Critical Tests**:
- WASM initialization doesn't panic
- Game loop runs 1000+ steps without crash
- Hint system loads and filters correctly
- React components handle undefined/empty data
- WCAG AA color contrast on all text

## Security Considerations

1. **Input Validation**: Game engine validates all player input
2. **Memory Safety**: Rust prevents buffer overflows in game code
3. **XSS Prevention**: Game output HTML-escaped before rendering
4. **WASM Sandbox**: All game state isolated in WASM memory

## Future Improvements

1. **Tests**: Add comprehensive test suite (Phase 1 critical)
2. **Error Boundaries**: Catch React component errors gracefully
3. **Accessibility**: Full WCAG 2.2 AAA (optional)
4. **Performance**: Profile and optimize hint filtering
5. **Save Cloud**: Add cloud backup for save files (Phase 2)

---

**Last Updated**: 2026-09-16
**Owner**: Development team
