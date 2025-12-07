import { useState, useEffect, useCallback, useRef } from 'react';
import { setWasmModule } from '../env-shim';

interface WasmExports {
  memory: WebAssembly.Memory;
  create: () => void;
  feed: (input: string) => void;
  step: () => boolean;
  get_updates: () => void;
  get_room_ascii_art: () => string | undefined;
  get_location: () => string;
  get_hints_for_location: (location: string) => string;
  get_hint_answer: (question_idx: number, level: number) => string | undefined;
  undo: () => boolean;
  redo: () => boolean;
  save: () => string | undefined;
  restore: (data: string) => void;
  load_savestate: (data: string) => void;
  get_messages: () => string;
  clear_messages: () => void;
}

interface GameUpdate {
  text?: string;
  lines?: string[];
  output?: string;
  message?: string;
}

export function useWasm() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const wasmRef = useRef<WasmExports | null>(null);
  const messagesRef = useRef<Map<string, string>>(new Map());

  // Initialize WASM module
  useEffect(() => {
    async function loadWasm() {
      console.log('[useWasm] Starting WASM initialization');
      try {
        setIsLoading(true);
        setError(null);

        // Load and initialize wasm-bindgen generated module
        console.log('[useWasm] Importing WASM module');
        const wasmModule = await import('../wasm/h2g2_wasm.js');
        console.log('[useWasm] WASM module imported, exports:', Object.keys(wasmModule));
        const initWasm = wasmModule.default;
        const wasmInstance = await initWasm();
        console.log('WASM module initialized successfully');
        console.log('[useWasm] WASM instance exports:', Object.keys(wasmInstance));

        // Create a wrapper with both the module and instance for env-shim
        const wasmWithMemory = {
          ...wasmModule,
          memory: wasmInstance.memory,
        };
        setWasmModule(wasmWithMemory);

        wasmRef.current = wasmModule as unknown as WasmExports;

        // Initialize the game
        try {
          console.log('Calling create()');
          if (typeof wasmModule.create === 'function') {
            wasmModule.create();
            console.log('create() completed');
          } else {
            throw new Error('create function not found in WASM module');
          }
        } catch (e) {
          console.error('Error calling create():', e);
          throw e;
        }

        setIsInitialized(true);
        setIsLoading(false);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load WASM module';
        setError(message);
        setIsLoading(false);
        console.error('WASM load error:', err);
        console.error('Full error:', err);
        if (err instanceof Error) {
          console.error('Stack:', err.stack);
        }
      }
    }

    loadWasm();
  }, []);

  // Feed input to the game
  const feed = useCallback((input: string): void => {
    if (!wasmRef.current) return;
    wasmRef.current.feed(input);
  }, []);

  // Step the game forward
  const step = useCallback((): boolean => {
    if (!wasmRef.current) return false;
    return wasmRef.current.step();
  }, []);

  // Get updates from the game
  const getUpdates = useCallback((): GameUpdate | null => {
    if (!wasmRef.current) return null;

    // Call get_updates to trigger message processing
    wasmRef.current.get_updates();

    // Get messages from WASM message store
    try {
      const messagesJson = wasmRef.current.get_messages();
      const messages = JSON.parse(messagesJson);

      // Clear the store for next time
      wasmRef.current.clear_messages();

      // Return the messages
      if (messages.print) {
        return { output: messages.print };
      }
      if (messages.map) {
        return { output: messages.map };
      }
      if (Object.keys(messages).length > 0) {
        return { output: JSON.stringify(messages) };
      }
    } catch (e) {
      console.error('[useWasm] Error processing messages:', e);
    }

    return null;
  }, []);

  // Undo last action
  const undo = useCallback((): boolean => {
    if (!wasmRef.current) return false;
    return wasmRef.current.undo();
  }, []);

  // Redo last undone action
  const redo = useCallback((): boolean => {
    if (!wasmRef.current) return false;
    return wasmRef.current.redo();
  }, []);

  // Save game state
  const save = useCallback((): string | null => {
    if (!wasmRef.current) return null;
    const saveData = wasmRef.current.save();
    return saveData || null;
  }, []);

  // Restore game state
  const restore = useCallback((data: string): boolean => {
    if (!wasmRef.current) return false;
    try {
      wasmRef.current.load_savestate(data);
      return true;
    } catch {
      return false;
    }
  }, []);

  // Get ASCII art for current room
  const getRoomAsciiArt = useCallback((): string | null => {
    if (!wasmRef.current) return null;
    const art = wasmRef.current.get_room_ascii_art();
    return art || null;
  }, []);

  // Get current location
  const getLocation = useCallback((): string => {
    if (!wasmRef.current) return '';
    return wasmRef.current.get_location();
  }, []);

  // Get hints for a location
  const getHintsForLocation = useCallback((location: string): string => {
    if (!wasmRef.current) return '[]';
    return wasmRef.current.get_hints_for_location(location);
  }, []);

  // Get specific hint answer
  const getHintAnswer = useCallback((questionIdx: number, level: number): string | undefined => {
    if (!wasmRef.current) return undefined;
    return wasmRef.current.get_hint_answer(questionIdx, level);
  }, []);

  return {
    isLoading,
    error,
    isInitialized,
    feed,
    step,
    getUpdates,
    getRoomAsciiArt,
    getLocation,
    getHintsForLocation,
    getHintAnswer,
    undo,
    redo,
    save,
    restore,
  };
}
