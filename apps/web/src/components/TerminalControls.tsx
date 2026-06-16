import { useState } from 'react';
import { Undo2, Redo2, Save, FolderOpen, Trash2, ChevronDown } from 'lucide-react';
import styles from './TerminalControls.module.css';

interface TerminalControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  disabled: boolean;
  /** Optionally force the toolbar open from outside. The bar otherwise reveals
   *  on hover, keyboard focus, or tapping the handle. */
  visible?: boolean;
}

export function TerminalControls({
  onUndo,
  onRedo,
  onSave,
  onLoad,
  onClear,
  disabled,
  visible = false,
}: TerminalControlsProps) {
  const [open, setOpen] = useState(false);
  const shown = visible || open;

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.handle}
        aria-label={shown ? 'Hide game controls' : 'Show game controls'}
        aria-expanded={shown}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
      >
        <ChevronDown
          className={`${styles.handleIcon} ${shown ? styles.handleIconOpen : ''}`}
          aria-hidden="true"
        />
      </button>

      <div
        className={`${styles.toolbar} ${shown ? styles.visible : styles.hidden}`}
        role="toolbar"
        aria-label="Game controls"
      >
        <ControlButton onClick={onUndo} disabled={disabled} title="Undo (previous state)" aria-label="Undo - Restore previous game state">
          <Undo2 className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>UNDO</span>
        </ControlButton>

        <ControlButton onClick={onRedo} disabled={disabled} title="Redo (next state)" aria-label="Redo - Restore next game state">
          <Redo2 className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>REDO</span>
        </ControlButton>

        <div className={styles.divider} aria-hidden="true" />

        <ControlButton onClick={onSave} disabled={disabled} title="Save game" aria-label="Save - Save current game to a slot">
          <Save className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>SAVE</span>
        </ControlButton>

        <ControlButton onClick={onLoad} disabled={disabled} title="Load game" aria-label="Load - Load game from a saved slot">
          <FolderOpen className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>LOAD</span>
        </ControlButton>

        <div className={styles.divider} aria-hidden="true" />

        <ControlButton onClick={onClear} disabled={false} title="Clear screen (Ctrl+L)" aria-label="Clear - Clear terminal output">
          <Trash2 className={styles.icon} aria-hidden="true" />
          <span className={styles.label}>CLEAR</span>
        </ControlButton>
      </div>
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

function ControlButton({ onClick, disabled, title, 'aria-label': ariaLabel, children }: ControlButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      aria-label={ariaLabel}
      className={styles.button}
    >
      {children}
    </button>
  );
}
