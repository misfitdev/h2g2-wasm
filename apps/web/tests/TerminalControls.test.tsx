import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TerminalControls } from '@/components/TerminalControls';

describe('TerminalControls', () => {
  const createMockHandlers = () => ({
    onUndo: vi.fn(),
    onRedo: vi.fn(),
    onSave: vi.fn(),
    onLoad: vi.fn(),
    onClear: vi.fn(),
  });

  it('renders toolbar when visible', () => {
    const mockHandlers = createMockHandlers();
    const { container } = render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    expect(container.querySelector('[role="toolbar"]')).toBeInTheDocument();
  });

  it('hides controls when not visible', () => {
    const mockHandlers = createMockHandlers();
    const { container } = render(
      <TerminalControls
        visible={false}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    const toolbar = container.querySelector('[role="toolbar"]');
    const hasHiddenClass = toolbar?.className.includes('hidden') ||
                          toolbar?.className.includes('opacity-0') ||
                          toolbar?.className.includes('pointer-events-none');
    expect(hasHiddenClass).toBe(true);
  });

  it('calls onUndo when undo button clicked', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByLabelText(/Undo/i));
    expect(mockHandlers.onUndo).toHaveBeenCalled();
  });

  it('calls onRedo when redo button clicked', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByLabelText(/Redo/i));
    expect(mockHandlers.onRedo).toHaveBeenCalled();
  });

  it('calls onLoad when load button clicked', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByLabelText(/Load/i));
    expect(mockHandlers.onLoad).toHaveBeenCalled();
  });

  it('calls onClear when clear button clicked', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    fireEvent.click(screen.getByLabelText(/Clear/i));
    expect(mockHandlers.onClear).toHaveBeenCalled();
  });

  it('disables game control buttons when disabled prop is true', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={true}
      />
    );
    const undoButton = screen.getByLabelText(/Undo/i) as HTMLButtonElement;
    const redoButton = screen.getByLabelText(/Redo/i) as HTMLButtonElement;
    const loadButton = screen.getByLabelText(/Load/i) as HTMLButtonElement;

    expect(undoButton.disabled).toBe(true);
    expect(redoButton.disabled).toBe(true);
    expect(loadButton.disabled).toBe(true);
  });

  it('keeps clear button enabled even when disabled prop is true', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={true}
      />
    );
    const clearButton = screen.getByLabelText(/Clear/i) as HTMLButtonElement;
    expect(clearButton.disabled).toBe(false);
  });

  it('has proper ARIA attributes', () => {
    const mockHandlers = createMockHandlers();
    render(
      <TerminalControls
        visible={true}
        onUndo={mockHandlers.onUndo}
        onRedo={mockHandlers.onRedo}
        onSave={mockHandlers.onSave}
        onLoad={mockHandlers.onLoad}
        onClear={mockHandlers.onClear}
        disabled={false}
      />
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar).toHaveAttribute('aria-label', 'Game controls');
  });
});
