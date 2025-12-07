import { useEffect, useState, useCallback, useRef } from 'react';
import { useWasm } from '@/hooks/useWasm';
import styles from './HintModal.module.css';

interface HintQuestion {
  question: string;
  answers: string[];
  section: string;
  tags: string[];
}

interface HintModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: string;
  totalHintsShown: number;
  onHintShown: () => void;
}

const BASE_TIMER_DURATION = 5000; // 5 seconds for first hint

export function HintModal({ isOpen, onClose, location, totalHintsShown, onHintShown }: HintModalProps) {
  const { isInitialized, getHintsForLocation, getHintAnswer } = useWasm();
  const [questions, setQuestions] = useState<Array<[number, HintQuestion]>>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [currentLevel, setCurrentLevel] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [timerProgress, setTimerProgress] = useState(100);
  const [canShowNext, setCanShowNext] = useState(false);
  const [viewedHints, setViewedHints] = useState<Set<string>>(new Set()); // Track viewed hints to avoid double-counting
  const [timerDisplay, setTimerDisplay] = useState<number | null>(null); // Show countdown in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getTimerDuration = useCallback(() => {
    return BASE_TIMER_DURATION * Math.pow(2, totalHintsShown); // Based on total hints shown globally
  }, [totalHintsShown]);

  useEffect(() => {
    if (!isOpen || !isInitialized) return;

    try {
      const questionsJson = getHintsForLocation(location);
      const parsed = JSON.parse(questionsJson);
      setQuestions(parsed || []);
      setSelectedIdx(null);
      setCurrentLevel(0);
      setCurrentAnswer('');
      setTimerProgress(100);
      setCanShowNext(false);
    } catch (e) {
      console.error('Failed to load hints:', e);
      setQuestions([]);
    }
  }, [isOpen, location, isInitialized, getHintsForLocation]);

  const startTimer = useCallback((hintId: string) => {
    setCanShowNext(false);
    setTimerProgress(100);

    // Only increment global counter if this is the first time viewing this hint
    if (!viewedHints.has(hintId)) {
      onHintShown();
      setViewedHints(prev => new Set([...prev, hintId]));
    }

    let elapsed = 0;
    const interval = 50;
    const total = getTimerDuration();
    setTimerDisplay(Math.ceil(total / 1000));

    timerRef.current = setInterval(() => {
      elapsed += interval;
      setTimerProgress(Math.max(0, 100 - (elapsed / total) * 100));
      setTimerDisplay(Math.ceil((total - elapsed) / 1000));

      if (elapsed >= total) {
        if (timerRef.current) clearInterval(timerRef.current);
        setCanShowNext(true);
        setTimerDisplay(null);
      }
    }, interval);
  }, [getTimerDuration, onHintShown, viewedHints]);

  const selectQuestion = useCallback((arrayPosition: number) => {
    if (!questions[arrayPosition]) {
      console.warn('HintModal: Selected question at position not found', arrayPosition);
      return;
    }

    const [questionIdx, question] = questions[arrayPosition];
    console.log('HintModal: Selected question', { arrayPosition, questionIdx, question: question.question });

    setSelectedIdx(arrayPosition);
    setCurrentLevel(0);

    const answer = getHintAnswer(questionIdx, 0);
    console.log('HintModal: Got answer for level 0', { answer });

    setCurrentAnswer(answer || question.answers[0] || '');
    startTimer(`${questionIdx}-0`);
  }, [questions, startTimer, getHintAnswer]);

  const showNextHint = useCallback(() => {
    if (!canShowNext || selectedIdx === null) return;
    if (!questions[selectedIdx]) return;

    const [questionIdx, question] = questions[selectedIdx];
    const nextLevel = currentLevel + 1;

    if (nextLevel < question.answers.length) {
      const answer = getHintAnswer(questionIdx, nextLevel);
      setCurrentAnswer(answer || question.answers[nextLevel] || '');
      setCurrentLevel(nextLevel);
      startTimer(`${questionIdx}-${nextLevel}`);
    } else {
      setCanShowNext(false);
      setTimerProgress(100);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  }, [canShowNext, selectedIdx, currentLevel, questions, startTimer, getHintAnswer]);

  const handleBack = useCallback(() => {
    setSelectedIdx(null);
    setCurrentLevel(0);
    setCurrentAnswer('');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const handleClose = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    onClose();
  }, [onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isOpen, handleClose]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className={styles.container} role="presentation">
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="hint-modal-title">
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleContainer}>
            <h2 id="hint-modal-title" className={styles.title}>
              <s>In</s>visiClues
            </h2>
            {timerDisplay !== null && (
              <div className={styles.timerDisplay} aria-live="polite" aria-atomic="true">
                {timerDisplay}s
              </div>
            )}
          </div>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            aria-label="Close hint system"
            title="Press Escape to close"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className={styles.content} role="main" aria-label="Hint system content">
          {selectedIdx === null ? (
            <div className={styles.questionsList}>
              <p className={styles.introText} aria-live="polite" aria-atomic="true">
                Available hints for: <span style={{ fontWeight: 'bold' }}>{location}</span>
              </p>

              {questions.length === 0 ? (
                <p className={styles.noHints} role="status" aria-live="polite">
                  No hints available for this location.
                </p>
              ) : (
                <div role="region" aria-label={`${questions.length} hint questions available for ${location}`}>
                  {questions.map(([idx, question], arrayPosition) => (
                    <button
                      key={idx}
                      onClick={() => selectQuestion(arrayPosition)}
                      className={styles.questionButton}
                      aria-label={question.question}
                      title={question.question}
                    >
                      {question.question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.answerView}>
              <button onClick={handleBack} className={styles.backButton} aria-label="Return to question list">
                ← Back to questions
              </button>

              {selectedIdx !== null && questions[selectedIdx] && (
                <>
                  <div role="region" aria-labelledby="hint-question-label" aria-live="polite">
                    <p id="hint-question-label" className={styles.sectionLabel}>
                      QUESTION:
                    </p>
                    <p className={styles.sectionContent}>{questions[selectedIdx][1].question}</p>
                  </div>

                  <div role="region" aria-labelledby="hint-answer-label" aria-live="polite" aria-atomic="true">
                    <p id="hint-answer-label" className={styles.sectionLabel}>
                      HINT:
                    </p>
                    <p className={`${styles.sectionContent} ${!canShowNext ? styles.revealing : ''}`}>
                      {currentAnswer}
                      {!canShowNext && (
                        <div
                          className={styles.revealOverlay}
                          style={{ opacity: timerProgress / 100 }}
                        />
                      )}
                    </p>
                  </div>

                  {currentLevel < (questions[selectedIdx][1].answers.length - 1) && (
                    <div className={styles.nextHintContainer}>
                      <button
                        onClick={showNextHint}
                        disabled={!canShowNext}
                        className={styles.nextHintButton}
                        aria-label={`Show next hint level ${currentLevel + 1} of ${questions[selectedIdx][1].answers.length}`}
                      >
                        <div
                          className={styles.timerProgress}
                          style={{ width: `${timerProgress}%` }}
                          role="progressbar"
                          aria-valuenow={Math.round(timerProgress)}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label="Hint timer"
                        />
                        <span className={styles.timerLabel}>NEXT HINT</span>
                      </button>
                    </div>
                  )}

                  {currentLevel >= (questions[selectedIdx][1].answers.length - 1) && (
                    <p className={styles.noMoreHints} role="status" aria-live="polite">
                      (No more hints available for this question)
                    </p>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
