import { Undo2, Redo2, Save, FolderOpen, Trash2 } from 'lucide-react';
import styles from './TerminalControls.module.css';

interface TerminalControlsProps {
  visible: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  disabled: boolean;
}

export function TerminalControls({
  visible,
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onClear,
  disabled,
}: TerminalControlsProps) {
  return (
    <div
      className={`${styles.toolbar} ${visible ? styles.visible : styles.hidden}`}
      role="toolbar"
      aria-label="Game controls"
    >
      <ControlButton
        onClick={onUndo}
        disabled={disabled}
        title="Undo (previous state)"
        aria-label="Undo - Restore previous game state"
      >
        <Undo2 className={styles.icon} aria-hidden="true" />
        <span className="text-xs terminal-text-dim">UNDO</span>
      </ControlButton>

      <ControlButton
        onClick={onRedo}
        disabled={disabled}
        title="Redo (next state)"
        aria-label="Redo - Restore next game state"
      >
        <Redo2 className={styles.icon} aria-hidden="true" />
        <span className="text-xs terminal-text-dim">REDO</span>
      </ControlButton>

      <div className={styles.divider} aria-hidden="true" />

      <ControlButton
        onClick={onSave}
        disabled={disabled}
        title="Save game"
        aria-label="Save - Save current game to a slot"
      >
        <Save className={styles.icon} aria-hidden="true" />
        <span className="text-xs terminal-text-dim">SAVE</span>
      </ControlButton>

      <ControlButton
        onClick={onLoad}
        disabled={disabled}
        title="Load game"
        aria-label="Load - Load game from a saved slot"
      >
        <FolderOpen className={styles.icon} aria-hidden="true" />
        <span className="text-xs terminal-text-dim">LOAD</span>
      </ControlButton>

      <div className={styles.divider} aria-hidden="true" />

      <ControlButton
        onClick={onClear}
        disabled={false}
        title="Clear screen (Ctrl+L)"
        aria-label="Clear - Clear terminal output"
      >
        <Trash2 className={styles.icon} aria-hidden="true" />
        <span className="text-xs terminal-text-dim">CLEAR</span>
      </ControlButton>
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  disabled: boolean;
  title: string;
  'aria-label': string;
  children: React.ReactNode;
}

function ControlButton({
  onClick,
  disabled,
  title,
  'aria-label': ariaLabel,
  children,
}: ControlButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={`${styles.button} ${disabled ? styles.disabled : ''}`}
    >
      {children}
    </button>
  );
}
