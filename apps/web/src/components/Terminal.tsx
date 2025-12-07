import { useEffect, useRef, useState, useCallback, KeyboardEvent } from 'react';
import { useWasm } from '@/hooks/useWasm';
import { useTerminal, TerminalLine } from '@/hooks/useTerminal';
import { useWasmChecksum } from '@/hooks/useWasmChecksum';
import { TerminalControls } from './TerminalControls';
import { SaveLoadDialog } from './SaveLoadDialog';
import { HintModal } from './HintModal';
import { DebugPanel } from './DebugPanel';
import styles from './Terminal.module.css';

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
  const [showControls, setShowControls] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [hintModalOpen, setHintModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState('');
  const [totalHintsShown, setTotalHintsShown] = useState(0);
  const [showDebug, setShowDebug] = useState(() => {
    if (typeof window !== 'undefined') {
      return new URLSearchParams(window.location.search).get('debug') === '1';
    }
    return false;
  });

  const wasmChecksum = useWasmChecksum();

  const outputRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, []);

  // Auto-hide controls after 2s idle
  const scheduleHideControls = useCallback(() => {
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    hideControlsTimerRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  }, []);

  const handleMouseEnter = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
  }, []);

  const handleMouseMove = useCallback(() => {
    scheduleHideControls();
  }, [scheduleHideControls]);

  useEffect(() => {
    scrollToBottom();
  }, [lines, scrollToBottom]);

  // Focus input on click anywhere
  const handleContainerClick = useCallback(() => {
    inputRef.current?.focus();
  }, []);

  // Process game updates
  const processUpdates = useCallback(() => {
    if (!isInitialized) return;

    // Step the game
    let hasMore = true;
    let iterations = 0;
    const maxIterations = 100;

    while (hasMore && iterations < maxIterations) {
      hasMore = step();
      iterations++;
    }

    // Get and display updates
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
        addLines(updates.lines.filter(filterLine));
      } else if (updates.text) {
        const textLines = updates.text.split('\n');
        addLines(textLines.filter(filterLine));
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

        addLines(htmlLines.filter(filterLine));
      } else if (updates.message) {
        addLine(updates.message);
      }
    }
  }, [isInitialized, step, getUpdates, addLine, addLines]);

  // Initial game setup
  useEffect(() => {
    if (isInitialized) {
      addLine('═══════════════════════════════════════════════════════════════');
      addLine('  HITCHHIKER\'S GUIDE TO THE GALAXY - TERMINAL INTERFACE');
      addLine('═══════════════════════════════════════════════════════════════');
      addLine('');
      addLine('WASM module loaded successfully.');
      addLine('Type commands and press ENTER to interact with the game.');
      addLine('Press Ctrl+L to clear screen. Hover top of screen for controls.');
      addLine('');
      processUpdates();
      // Fetch initial location from game state
      const location = getLocation();
      setCurrentLocation(location);
    }
  }, [isInitialized, addLine, processUpdates, getLocation]);

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
        const location = getLocation();
        setCurrentLocation(location);
        setHintModalOpen(true);
        // Keep focus on input despite hint modal opening
        setTimeout(() => inputRef.current?.focus(), 0);
      }
      return;
    }

    addLine(`> ${input}`, true);
    addToHistory(input.trim());
    setInput('');

    if (isInitialized) {
      // Always feed input to the game, even if empty (some games require just Enter)
      feed(input.trim());
      processUpdates();
      // Update current location after each command
      const location = getLocation();
      setCurrentLocation(location);
    }
  }, [input, isInitialized, addLine, addToHistory, feed, processUpdates, getLocation]);

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
    }
  }, [handleSubmit, navigateHistory, clearScreen, scrollToBottom]);

  // Control handlers
  const handleUndo = useCallback(() => {
    if (undo()) {
      addLine('[UNDO]');
      processUpdates();
      const location = getLocation();
      setCurrentLocation(location);
    } else {
      addLine('[Nothing to undo]');
    }
  }, [undo, addLine, processUpdates, getLocation]);

  const handleRedo = useCallback(() => {
    if (redo()) {
      addLine('[REDO]');
      processUpdates();
      const location = getLocation();
      setCurrentLocation(location);
    } else {
      addLine('[Nothing to redo]');
    }
  }, [redo, addLine, processUpdates, getLocation]);

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
      const location = getLocation();
      setCurrentLocation(location);
    } else {
      addLine('[Load failed]');
    }
    setLoadDialogOpen(false);
  }, [loadFromSlot, restore, addLine, processUpdates, feed, getLastCommand, getLocation]);

  const handleDelete = useCallback((slotName: string) => {
    if (deleteSlot(slotName)) {
      addLine(`[Deleted save slot: ${slotName}]`);
    }
  }, [deleteSlot, addLine]);

  return (
    <div
      className={`${styles.container} scanlines crt-effect boot-flicker`}
      onClick={handleContainerClick}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(false)}
      role="application"
      aria-label="Hitchhiker's Guide to the Galaxy - Game Terminal"
    >
      {/* Control bar - appears on hover */}
      <TerminalControls
        visible={showControls}
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
        className={styles.output}
        role="log"
        aria-label="Game output"
        aria-live="polite"
        aria-atomic="false"
      >
        {lines.map((line) => (
          <TerminalLineComponent key={line.id} line={line} />
        ))}
      </div>

      {/* Input area */}
      <div className={styles.inputArea}>
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

function TerminalLineComponent({ line }: { line: TerminalLine }) {
  const hasHtmlTags = line.content && /<[^>]+>/.test(line.content);
  const lineClass = `${styles.line} ${line.isInput ? styles.lineInput : styles.lineOutput}`;

  if (hasHtmlTags) {
    return (
      <div
        className={lineClass}
        dangerouslySetInnerHTML={{ __html: line.content || '' }}
      />
    );
  }

  return (
    <div className={lineClass}>
      {line.content || '\u00A0'}
    </div>
  );
}
