import { useState, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'h2g2_save_';
const MAX_HISTORY = 100;

export interface TerminalLine {
  id: number;
  content: string;
  isInput?: boolean;
}

export function useTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const lineIdRef = useRef(0);

  const addLine = useCallback((content: string, isInput = false) => {
    const id = ++lineIdRef.current;
    setLines(prev => [...prev, { id, content, isInput }]);
  }, []);

  const addLines = useCallback((contents: string[]) => {
    setLines(prev => [
      ...prev,
      ...contents.map(content => ({
        id: ++lineIdRef.current,
        content,
      })),
    ]);
  }, []);

  const clearScreen = useCallback(() => {
    setLines([]);
  }, []);

  const addToHistory = useCallback((command: string) => {
    if (!command.trim()) return;
    setCommandHistory(prev => {
      const filtered = prev.filter(c => c !== command);
      const newHistory = [command, ...filtered].slice(0, MAX_HISTORY);
      return newHistory;
    });
    setHistoryIndex(-1);
    // Save the last command for context on load
    try {
      localStorage.setItem('h2g2_last_command', command);
    } catch {}
  }, []);

  const navigateHistory = useCallback((direction: 'up' | 'down'): string | null => {
    if (commandHistory.length === 0) return null;

    let newIndex: number;
    if (direction === 'up') {
      newIndex = Math.min(historyIndex + 1, commandHistory.length - 1);
    } else {
      newIndex = Math.max(historyIndex - 1, -1);
    }

    setHistoryIndex(newIndex);
    return newIndex >= 0 ? commandHistory[newIndex] : '';
  }, [commandHistory, historyIndex]);

  // Save/Load functionality
  const getSaveSlots = useCallback((): string[] => {
    const slots: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        slots.push(key.replace(STORAGE_PREFIX, ''));
      }
    }
    return slots.sort();
  }, []);

  const saveToSlot = useCallback((slotName: string, data: string): boolean => {
    try {
      localStorage.setItem(STORAGE_PREFIX + slotName, data);
      return true;
    } catch {
      return false;
    }
  }, []);

  const loadFromSlot = useCallback((slotName: string): string | null => {
    return localStorage.getItem(STORAGE_PREFIX + slotName);
  }, []);

  const deleteSlot = useCallback((slotName: string): boolean => {
    try {
      localStorage.removeItem(STORAGE_PREFIX + slotName);
      return true;
    } catch {
      return false;
    }
  }, []);

  const getLastCommand = useCallback((): string | null => {
    try {
      return localStorage.getItem('h2g2_last_command');
    } catch {
      return null;
    }
  }, []);

  return {
    lines,
    addLine,
    addLines,
    clearScreen,
    commandHistory,
    addToHistory,
    navigateHistory,
    historyIndex,
    getSaveSlots,
    saveToSlot,
    loadFromSlot,
    deleteSlot,
    getLastCommand,
  };
}
