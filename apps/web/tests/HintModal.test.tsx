import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { HintModal } from '@/components/HintModal';

let mockGetHintAnswer: ReturnType<typeof vi.fn>;
let mockGetHintsForLocation: ReturnType<typeof vi.fn>;

vi.mock('@/hooks/useWasm', () => ({
  useWasm: () => ({
    isInitialized: true,
    getHintsForLocation: mockGetHintsForLocation,
    getHintAnswer: mockGetHintAnswer,
  }),
}));

beforeEach(() => {
  mockGetHintsForLocation = vi.fn(() => JSON.stringify([]));
  mockGetHintAnswer = vi.fn(() => '');
});

describe('HintModal', () => {
  it('renders without crashing when open', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    render(<HintModal isOpen={true} onClose={mockOnClose} location="bedroom" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('displays visiClues title', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    render(<HintModal isOpen={true} onClose={mockOnClose} location="bedroom" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    expect(screen.getByText('visiClues')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    const { container } = render(<HintModal isOpen={false} onClose={mockOnClose} location="bedroom" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    expect(container.querySelector('[role="dialog"]')).not.toBeInTheDocument();
  });

  it('displays "No hints available" when location has no hints', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    render(<HintModal isOpen={true} onClose={mockOnClose} location="nonexistent" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    expect(screen.getByText('No hints available for this location.')).toBeInTheDocument();
  });

  it('handles empty location gracefully', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    render(<HintModal isOpen={true} onClose={mockOnClose} location="" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('closes when close button clicked', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    render(<HintModal isOpen={true} onClose={mockOnClose} location="bedroom" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    const closeButton = screen.getByLabelText('Close hint system');
    closeButton.click();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('has proper ARIA attributes for accessibility', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    render(<HintModal isOpen={true} onClose={mockOnClose} location="bedroom" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'hint-modal-title');
  });

  it('displays hint questions when available', () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    const hintData = JSON.stringify([
      [0, {
        question: 'How do I open the mailbox?',
        answers: ['Try pushing it', 'Try opening it'],
        section: 'general',
        tags: ['mailbox']
      }]
    ]);
    mockGetHintsForLocation.mockReturnValue(hintData);

    render(<HintModal isOpen={true} onClose={mockOnClose} location="west of house" totalHintsShown={0} onHintShown={mockOnHintShown} />);
    expect(screen.getByText('How do I open the mailbox?')).toBeInTheDocument();
  });

  it('shows hint answer when question is clicked', async () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    const hintData = JSON.stringify([
      [0, {
        question: 'How do I open the mailbox?',
        answers: ['Try pushing it', 'Try opening it'],
        section: 'general',
        tags: ['mailbox']
      }]
    ]);
    mockGetHintsForLocation.mockReturnValue(hintData);
    mockGetHintAnswer.mockReturnValue('Try pushing it');

    render(<HintModal isOpen={true} onClose={mockOnClose} location="west of house" totalHintsShown={0} onHintShown={mockOnHintShown} />);

    const questionButton = screen.getByText('How do I open the mailbox?');
    fireEvent.click(questionButton);

    await waitFor(() => {
      expect(screen.getByText('Try pushing it')).toBeInTheDocument();
    });
  });

  it('shows back button after selecting a question', async () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    const hintData = JSON.stringify([
      [0, {
        question: 'How do I open the mailbox?',
        answers: ['Try pushing it'],
        section: 'general',
        tags: ['mailbox']
      }]
    ]);
    mockGetHintsForLocation.mockReturnValue(hintData);
    mockGetHintAnswer.mockReturnValue('Try pushing it');

    render(<HintModal isOpen={true} onClose={mockOnClose} location="west of house" totalHintsShown={0} onHintShown={mockOnHintShown} />);

    const questionButton = screen.getByText('How do I open the mailbox?');
    fireEvent.click(questionButton);

    await waitFor(() => {
      expect(screen.getByText('← Back to questions')).toBeInTheDocument();
    });
  });

  it('returns to question list when back button clicked', async () => {
    const mockOnClose = vi.fn();
    const mockOnHintShown = vi.fn();
    const hintData = JSON.stringify([
      [0, {
        question: 'How do I open the mailbox?',
        answers: ['Try pushing it'],
        section: 'general',
        tags: ['mailbox']
      }]
    ]);
    mockGetHintsForLocation.mockReturnValue(hintData);
    mockGetHintAnswer.mockReturnValue('Try pushing it');

    render(<HintModal isOpen={true} onClose={mockOnClose} location="west of house" totalHintsShown={0} onHintShown={mockOnHintShown} />);

    const questionButton = screen.getByText('How do I open the mailbox?');
    fireEvent.click(questionButton);

    await waitFor(() => {
      const backButton = screen.getByText('← Back to questions');
      expect(backButton).toBeInTheDocument();
      fireEvent.click(backButton);
    });

    await waitFor(() => {
      expect(screen.getByText('How do I open the mailbox?')).toBeInTheDocument();
    });
  });
});
