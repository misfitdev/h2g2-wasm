import { useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import styles from './SaveLoadDialog.module.css';

interface SaveLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'save' | 'load';
  slots: string[];
  onAction: (slotName: string) => void;
  onDelete: (slotName: string) => void;
}

export function SaveLoadDialog({
  open,
  onOpenChange,
  mode,
  slots,
  onAction,
  onDelete,
}: SaveLoadDialogProps) {
  const [newSlotName, setNewSlotName] = useState('');

  if (!open) return null;

  const handleAction = (slotName: string) => {
    onAction(slotName);
    setNewSlotName('');
  };

  const handleCreateNew = () => {
    const name = newSlotName.trim() || `save_${Date.now()}`;
    handleAction(name);
  };

  const isLoad = mode === 'load';
  const dialogTitle = isLoad ? 'Load Game' : 'Save Game';

  return (
    <div
      className={styles.overlay}
      onClick={() => onOpenChange(false)}
      role="presentation"
    >
      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="dialog-title" className={styles.title}>
            {isLoad ? '[ LOAD GAME ]' : '[ SAVE GAME ]'}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className={styles.closeButton}
            aria-label="Close dialog"
            title="Close (Escape)"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Save slots */}
        <div
          className={styles.slotsContainer}
          role="region"
          aria-label={isLoad ? 'Available saved games' : 'Save slots'}
        >
          {slots.length === 0 && isLoad && (
            <div
              className={styles.emptyMessage}
              role="status"
              aria-live="polite"
            >
              No saved games found.
            </div>
          )}

          {slots.map((slot) => (
            <div
              key={slot}
              className={styles.slotItem}
            >
              <button
                onClick={() => handleAction(slot)}
                className={styles.slotButton}
                aria-label={isLoad ? `Load saved game: ${slot}` : `Save to slot: ${slot}`}
              >
                {slot}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(slot);
                }}
                className={styles.deleteButton}
                title={`Delete ${slot}`}
                aria-label={`Delete save slot: ${slot}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>

        {/* New save input (save mode only) */}
        {mode === 'save' && (
          <div className={styles.inputSection}>
            <label htmlFor="save-name-input" className={styles.inputLabel}>
              Save name (optional):
            </label>
            <div className={styles.inputGroup}>
              <input
                id="save-name-input"
                type="text"
                value={newSlotName}
                onChange={(e) => setNewSlotName(e.target.value)}
                placeholder="Enter save name..."
                className={styles.input}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNew();
                }}
                aria-label="Enter custom save name"
              />
              <button
                onClick={handleCreateNew}
                className={styles.saveButton}
                aria-label={newSlotName.trim() ? `Save as: ${newSlotName}` : 'Save with auto-generated name'}
              >
                SAVE
              </button>
            </div>
          </div>
        )}

        {/* Cancel button */}
        <div className={styles.cancelSection}>
          <button
            onClick={() => onOpenChange(false)}
            className={styles.cancelButton}
            aria-label="Cancel and close dialog"
          >
            CANCEL
          </button>
        </div>
      </div>
    </div>
  );
}
