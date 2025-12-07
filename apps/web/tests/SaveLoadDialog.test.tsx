import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SaveLoadDialog } from '@/components/SaveLoadDialog';

describe('SaveLoadDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnAction = vi.fn();
  const mockOnDelete = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Save Mode', () => {
    it('renders save dialog when open in save mode', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={['slot1', 'slot2']}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText('[ SAVE GAME ]')).toBeInTheDocument();
    });

    it('does not render when closed', () => {
      const { container } = render(
        <SaveLoadDialog
          open={false}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
    });

    it('displays save input field in save mode', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByPlaceholderText('Enter save name...')).toBeInTheDocument();
    });

    it('calls onAction with slot name when save button clicked', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const saveButton = screen.getByText('SAVE');
      fireEvent.click(saveButton);
      expect(mockOnAction).toHaveBeenCalled();
    });
  });

  describe('Load Mode', () => {
    it('renders load dialog when open in load mode', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={['save1']}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText('[ LOAD GAME ]')).toBeInTheDocument();
    });

    it('does not display save input in load mode', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.queryByPlaceholderText('Enter save name...')).not.toBeInTheDocument();
    });

    it('displays "No saved games found" when empty', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByText('No saved games found.')).toBeInTheDocument();
    });
  });

  describe('Slot Management', () => {
    it('displays all save slots', () => {
      const slots = ['quicksave', 'autosave', 'checkpoint'];
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={slots}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      slots.forEach((slot) => {
        expect(screen.getByText(slot)).toBeInTheDocument();
      });
    });

    it('calls onAction when slot clicked', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={['mysave']}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const slotButton = screen.getByLabelText('Load saved game: mysave');
      fireEvent.click(slotButton);
      expect(mockOnAction).toHaveBeenCalledWith('mysave');
    });

    it('calls onDelete when delete button clicked', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={['mysave']}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const deleteButton = screen.getByLabelText('Delete save slot: mysave');
      fireEvent.click(deleteButton);
      expect(mockOnDelete).toHaveBeenCalledWith('mysave');
    });
  });

  describe('Accessibility', () => {
    it('has proper dialog role and ARIA attributes', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');
    });

    it('has labeled input field', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const input = screen.getByLabelText('Enter custom save name');
      expect(input).toBeInTheDocument();
    });

    it('has region role for slots list', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="load"
          slots={['save1']}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      expect(screen.getByLabelText('Available saved games')).toBeInTheDocument();
    });
  });

  describe('Close Behavior', () => {
    it('closes dialog when close button clicked', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const closeButton = screen.getByLabelText('Close dialog');
      fireEvent.click(closeButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes dialog when cancel button clicked', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const cancelButton = screen.getByText('CANCEL');
      fireEvent.click(cancelButton);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('closes when clicking outside dialog', () => {
      render(
        <SaveLoadDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          mode="save"
          slots={[]}
          onAction={mockOnAction}
          onDelete={mockOnDelete}
        />
      );
      const backdrop = screen.getByRole('presentation');
      fireEvent.click(backdrop);
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });
});
