import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { useWasm } from '@/hooks/useWasm';
import { useTerminal, TerminalLine } from '@/hooks/useTerminal';
import { useWasmChecksum } from '@/hooks/useWasmChecksum';
import { TerminalControls } from './TerminalControls';
import { SaveLoadDialog } from './SaveLoadDialog';
import { HintModal } from './HintModal';
import { DebugPanel } from './DebugPanel';
import { CRTScreen } from './CRTScreen';
import { GuidePane } from './GuidePane';
import { ImprobabilityDrive } from './ImprobabilityDrive';
import {
  createTimeline,
  appendTurn,
  setCurrent,
  transcriptFor,
  type Timeline,
} from '@/lib/timeline';
import styles from './Terminal.module.css';

const GUIDE_STORAGE_KEY = 'h2g2_guide_open';
const DRIVE_STORAGE_KEY = 'h2g2_drive_open';

export function Terminal() {
  const {
    isLoading,
    error,
    isInitialized,
    feed,
    step,
    getUpdates,
    getLocation,
    getHintsForLocation,
    getHintAnswer,
    undo,
    redo,
    save,
    restore,
  } = useWasm();

  const {
    lines,
    addLine,
    addLines,
    clearScreen,
    addToHistory,
    navigateHistory,
    getSaveSlots,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    getLastCommand,
  } = useTerminal();

  const [input, setInput] = useState('');
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [totalHintsShown, setTotalHintsShown] = useState(0);
  const [timeline, setTimeline] = useState<Timeline>(createTimeline);
  const [driveOpen, setDriveOpen] = useState(() => {
    try {
      return localStorage.getItem(DRIVE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [guideOpen, setGuideOpen] = useState(() => {
    try {
      return localStorage.getItem(GUIDE_STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [showDebug, setShowDebug] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('debug') === '1';
    }
    return false;
  });
  // Experimental: per-character phosphor burn-in on output. Opt-in via ?burnin=1.
  const [burnIn] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('burnin') === '1';
    }
    return false;
  });

  const wasmChecksum = useWasmChecksum();

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const syncLocation = useCallback(() => {
    setCurrentLocation(getLocation());
  }, [getLocation]);

  // Record the state at the prompt that follows a turn, so jumping to this
  // node lands the player exactly where they were.
  const recordTurn = useCallback((command: string | null, lines: string[]) => {
    const snapshot = save();
    if (!snapshot) return;
    setTimeline((prev) => appendTurn(prev, { command, snapshot, lines, location: getLocation() }));
  }, [save, getLocation]);

  const jumpTo = useCallback((id: number) => {
    const node = timeline.nodes[id];
    if (!node || id === timeline.currentId) return;

    if (!restore(node.snapshot)) {
      addLine('[The Improbability Drive declines to take you there.]');
      return;
    }

    clearScreen();
    addLines(transcriptFor(timeline, id));
    setTimeline((prev) => setCurrent(prev, id));
    syncLocation();
    inputRef.current?.focus();
  }, [timeline, restore, clearScreen, addLines, syncLocation, addLine]);

  const toggleGuide = useCallback(() => {
    setGuideOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(GUIDE_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // localStorage throws when quota is exhausted or storage is blocked.
      }
      return next;
    });
    inputRef.current?.focus();
  }, []);

  const toggleDrive = useCallback(() => {
    setDriveOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(DRIVE_STORAGE_KEY, next ? '1' : '0');
      } catch {
        // localStorage throws when quota is exhausted or storage is blocked.
      }
      return next;
    });
    inputRef.current?.focus();
  }, []);

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Focus input on click anywhere
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Process game updates
  const processUpdates = useCallback((): string[] => {
    if (!isInitialized) return [];

    // Step the game
    let hasMore = true;
    let iterations = 0;
    const maxIterations = 100;

    while (hasMore && iterations < maxIterations) {
      hasMore = step();
      iterations++;
    }

    // Get and display updates
    const produced: string[] = [];
    const updates = getUpdates();
    if (updates) {
      const filterLine = (line: string) => {
        if (!line) return false;
        const trimmed = line.trim();
        if (!trimmed) return false;
        // Strip all HTML tags
        let stripped = trimmed.replace(/<[^>]*>/g, '').trim();
        // Decode HTML entities for >
        stripped = stripped.replace(/&gt;/g, '>').trim();
        // Filter out empty lines and prompt-only lines
        if (!stripped || stripped === '>') return false;
        return true;
      };

      if (updates.lines) {
        produced.push(...updates.lines.filter(filterLine));
      } else if (updates.text) {
        const textLines = updates.text.split('\n');
        produced.push(...textLines.filter(filterLine));
      } else if (updates.output) {
        // Split on <br> but preserve multi-line HTML blocks like <pre>
        const htmlLines: string[] = [];
        let currentLine = '';
        let inPre = false;
        const parts = updates.output.split(/(<br>|<pre[^>]*>|<\/pre>)/);

        for (const part of parts) {
          if (part === '<br>') {
            if (!inPre && currentLine.trim() !== '') {
              htmlLines.push(currentLine);
              currentLine = '';
            } else if (inPre) {
              currentLine += part;
            }
          } else if (part.startsWith('<pre')) {
            inPre = true;
            currentLine += part;
          } else if (part === '</pre>') {
            inPre = false;
            currentLine += part;
          } else {
            currentLine += part;
          }
        }

        if (currentLine.trim() !== '') {
          htmlLines.push(currentLine);
        }

        produced.push(...htmlLines.filter(filterLine));
      } else if (updates.message) {
        produced.push(updates.message);
      }
    }

    if (produced.length > 0) addLines(produced);
    return produced;
  }, [isInitialized, step, getUpdates, addLines]);

  // Initial game setup
  useEffect(() => {
    if (isInitialized) {
      const banner = [
        '═══════════════════════════════════════════════════════════════',
        '  HITCHHIKER\'S GUIDE TO THE GALAXY - TERMINAL INTERFACE',
        '═══════════════════════════════════════════════════════════════',
        '',
        'WASM module loaded successfully.',
        'Type commands and press ENTER to interact with the game.',
        'Press Ctrl+L to clear screen. Hover top of screen for controls.',
        '',
      ];
      banner.forEach((line) => addLine(line));
      const produced = processUpdates();
      // The Z-machine is an external system: its opening turn must run before
      // the starting room can be read back, so this cannot be derived in render.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      syncLocation();
      recordTurn(null, [...banner, ...produced]);
    }
  }, [isInitialized, addLine, processUpdates, syncLocation, recordTurn]);

  // Display loading/error states
  useEffect(() => {
    if (isLoading) {
      addLine('Loading WASM module...');
    } else if (error) {
      addLine(`ERROR: ${error}`);
      addLine('');
      addLine('Make sure h2g2_wasm.wasm is in the public folder.');
    }
  }, [isLoading, error, addLine]);

  // Keep focus on input field at all times
  useEffect(() => {
    if (isInitialized) {
      inputRef.current?.focus();
    }
  }, [isInitialized, hintModalOpen]);

  // Handle command submission
  const handleSubmit = useCallback(() => {
    const trimmedInput = input.trim().toLowerCase();

    // Check for hint/help commands
    if (trimmedInput === 'hint' || trimmedInput === 'help') {
      addLine(`> ${input}`, true);
      addToHistory(input.trim());
      setInput('');

      if (isInitialized) {
        // Feed the command to keep game state consistent, then get location for hint modal
        feed(trimmedInput);
        processUpdates();
        syncLocation();
        setHintModalOpen(true);
        // Keep focus on input despite hint modal opening
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return;
    }

    const echoed = `> ${input}`;
    addLine(echoed, true);
    addToHistory(input.trim());
    setInput('');

    if (isInitialized) {
      // Always feed input to the game, even if empty (some games require just Enter)
      feed(input.trim());
      const produced = processUpdates();
      // Update current location after each command
      syncLocation();
      recordTurn(input.trim(), [echoed, ...produced]);
    }
  }, [input, isInitialized, addLine, addToHistory, feed, processUpdates, syncLocation, recordTurn]);

  // Handle keyboard events
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      scrollToBottom();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = navigateHistory('up');
      if (prev !== null) {
        setInput(prev);
        scrollToBottom();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = navigateHistory('down');
      if (next !== null) {
        setInput(next);
        scrollToBottom();
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clearScreen();
    } else if (e.key === 'g' && e.ctrlKey) {
      e.preventDefault();
      toggleGuide();
    } else if (e.key === 'i' && e.ctrlKey) {
      e.preventDefault();
      toggleDrive();
    }
  }, [handleSubmit, navigateHistory, clearScreen, scrollToBottom, toggleGuide, toggleDrive]);

  // Control handlers
  const handleUndo = useCallback(() => {
    if (undo()) {
      addLine('[UNDO]');
      processUpdates();
      syncLocation();
    } else {
      addLine('[Nothing to undo]');
    }
  }, [undo, addLine, processUpdates, syncLocation]);

  const handleRedo = useCallback(() => {
    if (redo()) {
      addLine('[REDO]');
      processUpdates();
      syncLocation();
    } else {
      addLine('[Nothing to redo]');
    }
  }, [redo, addLine, processUpdates, syncLocation]);

  const handleSave = useCallback((slotName: string) => {
    const saveData = save();
    if (saveData && saveToSlot(slotName, saveData)) {
      addLine(`[Game saved to slot: ${slotName}]`);
    } else {
      addLine('[Save failed]');
    }
    setSaveDialogOpen(false);
  }, [save, saveToSlot, addLine]);

  const handleLoad = useCallback((slotName: string) => {
    const saveData = loadFromSlot(slotName);
    if (saveData && restore(saveData)) {
      addLine(`[Game loaded from slot: ${slotName}]`);
      processUpdates();
      // Replay the last command to show context
      const lastCommand = getLastCommand();
      if (lastCommand) {
        addLine(`> ${lastCommand}`, true);
        feed(lastCommand);
        processUpdates();
      }
      // Update location after load
      syncLocation();
    } else {
      addLine('[Load failed]');
    }
    setLoadDialogOpen(false);
  }, [loadFromSlot, restore, addLine, processUpdates, feed, getLastCommand, syncLocation]);

  const handleDelete = useCallback((slotName: string) => {
    if (deleteSlot(slotName)) {
      addLine(`[Deleted save slot: ${slotName}]`);
    }
  }, [deleteSlot, addLine]);

  return (
    <div
      className={`${styles.container} scanlines crt-effect`}
      onClick={handleContainerClick}
      role="application"
      aria-label="Hitchhiker's Guide to the Galaxy - Game Terminal"
    >
      {/* CRT power-on sequence + ambient phosphor overlay */}
      <CRTScreen />

      {/* Control bar - always-visible handle reveals it on hover/focus/tap */}
      <TerminalControls
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={() => setSaveDialogOpen(true)}
        onLoad={() => setLoadDialogOpen(true)}
        onClear={clearScreen}
        disabled={!isInitialized}
      />

      {/* Output area */}
      <div
        ref={outputRef}
        className={`${styles.output} ${guideOpen ? styles.outputWithGuide : ''} ${driveOpen ? styles.outputWithDrive : ''}`}
        role="log"
        aria-label="Game output"
        aria-live="polite"
        aria-atomic="false"
      >
        {lines.map((line) => (
          <TerminalLineComponent key={line.id} line={line} burnIn={burnIn} />
        ))}
      </div>

      {/* Input area */}
      <div className={`${styles.inputArea} ${driveOpen ? styles.inputAreaWithDrive : ''}`}>
        <label htmlFor="game-input" className="sr-only">
          Game command input
        </label>
        <div className={styles.inputContainer}>
          <span className={styles.inputPrompt} aria-hidden="true">&gt;</span>
          <input
            id="game-input"
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
            placeholder="Type a command (e.g., 'look', 'help', 'examine floor')"
            aria-label="Game command input. Type commands to interact with the game."
            autoFocus
            spellCheck={false}
            autoComplete="off"
            autoCapitalize="off"
            disabled={!isInitialized && !error}
          />
        </div>
      </div>

      {/* Save Dialog */}
      <SaveLoadDialog
        open={saveDialogOpen}
        onOpenChange={setSaveDialogOpen}
        mode="save"
        slots={getSaveSlots()}
        onAction={handleSave}
        onDelete={handleDelete}
      />

      {/* Load Dialog */}
      <SaveLoadDialog
        open={loadDialogOpen}
        onOpenChange={setLoadDialogOpen}
        mode="load"
        slots={getSaveSlots()}
        onAction={handleLoad}
        onDelete={handleDelete}
      />

      {/* Hint Modal */}
      <HintModal
        isOpen={hintModalOpen}
        onClose={() => setHintModalOpen(false)}
        location={currentLocation}
        totalHintsShown={totalHintsShown}
        onHintShown={() => setTotalHintsShown(prev => prev + 1)}
      />

      <GuidePane location={currentLocation} open={guideOpen} onToggle={toggleGuide} />

      <ImprobabilityDrive
        timeline={timeline}
        open={driveOpen}
        onToggle={toggleDrive}
        onJump={jumpTo}
      />


      {/* Debug Panel */}
      {showDebug && (
        <DebugPanel
          location={currentLocation}
          gitHash={typeof __GIT_HASH__ !== 'undefined' ? __GIT_HASH__ : 'unknown'}
          wasmChecksum={wasmChecksum}
        />
      )}
    </div>
  );
}

function TerminalLineComponent({ line, burnIn }: { line: TerminalLine; burnIn?: boolean }) {
  const hasHtmlTags = line.content && /<[^>]+>/.test(line.content);
  const lineClass = `${styles.line} ${line.isInput ? styles.lineInput : styles.lineOutput}`;

  if (hasHtmlTags) {
    // HTML output (room names, ASCII art) can't be split per glyph safely.
    return (
      <div
        className={lineClass}
        dangerouslySetInnerHTML={{ __html: line.content || '' }}
      />
    );
  }

  const text = line.content || '\u00A0';

  // Burn-in only applies to plain game output, not the player's echoed input.
  if (burnIn && !line.isInput && line.content) {
    return (
      <div className={lineClass}>
        {Array.from(text).map((ch, i) => (
          <span
            key={i}
            className={styles.burnChar}
            style={{ animationDelay: `${i * 11}ms` }}
          >
            {ch}
          </span>
        ))}
      </div>
    );
  }

  return <div className={lineClass}>{text}</div>;
}
