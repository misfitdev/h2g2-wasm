import { useState } from 'react';
import { Undo2, Redo2, Save, FolderOpen, Trash2 } from 'lucide-react';
import styles from './TerminalControls.module.css';

interface TerminalControlsProps {
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onLoad: () => void;
  onClear: () => void;
  disabled: boolean;
  /** Optionally force the toolbar open from outside. */
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
    <div className={styles.zone}>
      <div className={`${styles.slider} ${shown ? styles.sliderOpen : ''}`}>
        <div
          className={`${styles.toolbar} ${shown ? styles.visible : styles.hidden}`}
          role="toolbar"
          aria-label="Game controls"
          aria-hidden={!shown}
        >
          <ControlButton onClick={onUndo} disabled={disabled} shown={shown} title="Undo (previous state)" aria-label="Undo - Restore previous game state">
            <Undo2 className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>UNDO</span>
          </ControlButton>

          <ControlButton onClick={onRedo} disabled={disabled} shown={shown} title="Redo (next state)" aria-label="Redo - Restore next game state">
            <Redo2 className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>REDO</span>
          </ControlButton>

          <div className={styles.divider} aria-hidden="true" />

          <ControlButton onClick={onSave} disabled={disabled} shown={shown} title="Save game" aria-label="Save - Save current game to a slot">
            <Save className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>SAVE</span>
          </ControlButton>

          <ControlButton onClick={onLoad} disabled={disabled} shown={shown} title="Load game" aria-label="Load - Load game from a saved slot">
            <FolderOpen className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>LOAD</span>
          </ControlButton>

          <div className={styles.divider} aria-hidden="true" />

          <ControlButton onClick={onClear} disabled={false} shown={shown} title="Clear screen (Ctrl+L)" aria-label="Clear - Clear terminal output">
            <Trash2 className={styles.icon} aria-hidden="true" />
            <span className={styles.label}>CLEAR</span>
          </ControlButton>
        </div>

        {/* Rides down with the toolbar, staying attached to its lower edge. */}
        <button
          type="button"
          className={styles.nub}
          aria-label={shown ? 'Hide game controls' : 'Show game controls'}
          aria-expanded={shown}
          onClick={(e) => {
            e.stopPropagation();
            setOpen((o) => !o);
          }}
        />
      </div>
    </div>
  );
}

interface ControlButtonProps {
  onClick: () => void;
  disabled: boolean;
  shown: boolean;
  title: string;
  'aria-label': string;
  children: React.ReactNode;
}

function ControlButton({ onClick, disabled, shown, title, 'aria-label': ariaLabel, children }: ControlButtonProps) {
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
      // Keep the stowed toolbar out of the tab order; it sits off-screen above.
      tabIndex={shown ? 0 : -1}
    >
      {children}
    </button>
  );
}
