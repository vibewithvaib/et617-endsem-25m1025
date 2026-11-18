import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock,
  HelpCircle,
  Lightbulb,
  ListChecks,
  RefreshCw,
  RotateCcw,
} from 'lucide-react';
import type {
  ChapterDefinition,
  ChapterProgress,
  LearningStepId,
  MasteryAnswerRecord,
  PracticeQuestion,
} from '../its/types';
import {
  LEARNING_STEPS,
  MASTERY_PASS_SCORE,
  SESSION_TARGET_SECONDS,
} from '../its/chapters';
import { evaluateAnswer, type AnswerEvaluation } from '../its/questionGenerator';
import { ChapterInteractiveWidget } from './ChapterInteractiveWidget';

interface ChapterViewProps {
  chapter: ChapterDefinition;
  progress: ChapterProgress;
  nextChapterTitle: string | null;
  sessionElapsedSeconds: number;
  onBackHome: () => void;
  onSelectStep: (step: LearningStepId) => void;
  onCompleteStepAndAdvance: (fromStep: LearningStepId, toStep: LearningStepId) => void;
  onMarkInteractiveExplored: () => void;
  onSelectAnswerDraft: (answer: string) => void;
  onShowHint: (step: 'guided' | 'independent', question: PracticeQuestion) => void;
  onSubmitPracticeAnswer: (
    step: 'guided' | 'independent',
    question: PracticeQuestion,
    answer: string,
    isCorrect: boolean,
    attemptNumber: number
  ) => void;
  onAdvancePracticeQuestion: (step: 'guided' | 'independent') => void;
  onRequestExtraPractice: (step: 'guided' | 'independent') => void;
  onSubmitMasteryAnswer: (
    question: PracticeQuestion,
    answer: string,
    isCorrect: boolean
  ) => void;
  onPracticeWeakConcepts: (weakConcepts: string[]) => void;
  onRetryMasteryCheck: () => void;
  onOpenNextChapter: () => void;
}

export const ChapterView: React.FC<ChapterViewProps> = ({
  chapter,
  progress,
  nextChapterTitle,
  sessionElapsedSeconds,
  onBackHome,
  onSelectStep,
  onCompleteStepAndAdvance,
  onMarkInteractiveExplored,
  onSelectAnswerDraft,
  onShowHint,
  onSubmitPracticeAnswer,
  onAdvancePracticeQuestion,
  onRequestExtraPractice,
  onSubmitMasteryAnswer,
  onPracticeWeakConcepts,
  onRetryMasteryCheck,
  onOpenNextChapter,
}) => {
  const [evaluation, setEvaluation] = useState<AnswerEvaluation | null>(null);
  const [showStepSupport, setShowStepSupport] = useState(false);
  const [showExtraExample, setShowExtraExample] = useState(false);
  const [dismissedTenMinNote, setDismissedTenMinNote] = useState(false);

  const currentStep = progress.currentStep;

  const activePracticeStep: 'guided' | 'independent' | null =
    currentStep === 'guided'
      ? 'guided'
      : currentStep === 'independent'
        ? 'independent'
        : null;

  const practiceQuestions =
    activePracticeStep === 'guided'
      ? progress.guidedQuestions
      : activePracticeStep === 'independent'
        ? progress.independentQuestions
        : [];
  const practiceIndex =
    activePracticeStep === 'guided'
      ? progress.guidedIndex
      : activePracticeStep === 'independent'
        ? progress.independentIndex
        : 0;
  const practiceCompletedIds =
    activePracticeStep === 'guided'
      ? progress.guidedCompletedIds
      : activePracticeStep === 'independent'
        ? progress.independentCompletedIds
        : [];
  const currentPracticeQ = practiceQuestions[practiceIndex];

  const masteryQuestions = progress.masteryQuestions;
  const masteryFinished =
    currentStep === 'mastery' &&
    masteryQuestions.length > 0 &&
    progress.masteryAnswers.length >= masteryQuestions.length;
  const currentMasteryQ = masteryQuestions[progress.masteryIndex];
  const latestMasteryResult =
    progress.masteryHistory[progress.masteryHistory.length - 1] ?? null;

  useEffect(() => {
    setEvaluation(null);
    setShowStepSupport(false);
    setShowExtraExample(false);
  }, [
    chapter.id,
    currentStep,
    progress.guidedIndex,
    progress.independentIndex,
    progress.masteryIndex,
    currentPracticeQ?.id,
    currentMasteryQ?.id,
  ]);

  const handlePracticeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePracticeStep || !currentPracticeQ || !progress.selectedAnswerDraft.trim()) {
      return;
    }
    const attemptNumber = progress.attemptsOnCurrent + 1;
    const res = evaluateAnswer(currentPracticeQ, progress.selectedAnswerDraft);
    setEvaluation(res);
    onSubmitPracticeAnswer(
      activePracticeStep,
      currentPracticeQ,
      progress.selectedAnswerDraft.trim(),
      res.isCorrect,
      attemptNumber
    );
  };

  const handleMasterySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMasteryQ || !progress.selectedAnswerDraft.trim()) return;
    const res = evaluateAnswer(currentMasteryQ, progress.selectedAnswerDraft);
    onSubmitMasteryAnswer(
      currentMasteryQ,
      progress.selectedAnswerDraft.trim(),
      res.isCorrect
    );
  };

  const canJumpToStep = (stepId: LearningStepId): boolean => {
    if (progress.status === 'completed') return true;
    if (stepId === progress.currentStep) return true;
    if (progress.completedSteps.includes(stepId)) return true;
    const targetIdx = LEARNING_STEPS.findIndex((s) => s.id === stepId);
    const highestCompletedIdx = progress.completedSteps.reduce((max, id) => {
      const idx = LEARNING_STEPS.findIndex((s) => s.id === id);
      return Math.max(max, idx);
    }, -1);
    return targetIdx <= highestCompletedIdx + 1;
  };

  const renderQuestionInputs = (
    question: PracticeQuestion,
    locked: boolean
  ) => {
    if (question.questionType === 'mcq' && question.options) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {question.options.map((opt) => {
            const isSelected = progress.selectedAnswerDraft === opt.value;
            return (
              <button
                key={opt.id}
                type="button"
                disabled={locked}
                onClick={() => {
                  onSelectAnswerDraft(opt.value);
                  if (evaluation && !evaluation.isCorrect) setEvaluation(null);
                }}
                className={`text-left px-4 py-3.5 rounded-xl border text-sm sm:text-base font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'border-[#795BFF] bg-[#F1EDFF] text-[#46546A]'
                    : 'border-[#DCE2F0] bg-[#F7F9FF] text-[#46546A] hover:border-[#B9A9FF] hover:bg-white'
                }`}
              >
                <span className="font-mono-math">{opt.label}</span>
              </button>
            );
          })}
        </div>
      );
    }

    if (question.questionType === 'short_answer') {
      return (
        <div className="space-y-1.5">
          <label
            htmlFor="short-answer-input"
            className="block text-xs font-medium text-[#7C879C]"
          >
            Write a short explanation in your own words
          </label>
          <textarea
            id="short-answer-input"
            rows={3}
            disabled={locked}
            value={progress.selectedAnswerDraft}
            onChange={(e) => {
              onSelectAnswerDraft(e.target.value);
              if (evaluation && !evaluation.isCorrect) setEvaluation(null);
            }}
            placeholder="Explain your reasoning in 1 or 2 sentences"
            className="w-full rounded-xl border border-[#DCE2F0] bg-[#F7F9FF] px-4 py-3 text-sm sm:text-base text-[#46546A] focus:outline-none focus:ring-2 focus:ring-[#795BFF] focus:bg-white"
          />
        </div>
      );
    }

    return (
      <div className="max-w-sm space-y-1.5">
        <label
          htmlFor="answer-text-input"
          className="block text-xs font-medium text-[#7C879C]"
        >
          {question.questionType === 'fill_blank'
            ? 'Fill in the missing value or ratio'
            : 'Enter your numerical answer'}
        </label>
        <div className="flex items-center gap-2.5">
          <input
            id="answer-text-input"
            type="text"
            disabled={locked}
            value={progress.selectedAnswerDraft}
            onChange={(e) => {
              onSelectAnswerDraft(e.target.value);
              if (evaluation && !evaluation.isCorrect) setEvaluation(null);
            }}
            placeholder={
              question.questionType === 'fill_blank' ? 'Type answer' : 'Enter number'
            }
            className="w-full rounded-xl border border-[#DCE2F0] bg-[#F7F9FF] px-4 py-2.5 text-base font-semibold text-[#46546A] font-mono-math focus:outline-none focus:ring-2 focus:ring-[#795BFF] focus:bg-white"
          />
          {question.unitLabel && (
            <span className="text-sm font-medium text-[#6A768C] whitespace-nowrap">
              {question.unitLabel}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Chapter Title & Back Link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <button
            type="button"
            onClick={onBackHome}
            className="text-xs font-medium text-[#7C879C] hover:text-[#795BFF] inline-flex items-center gap-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Back to Home</span>
          </button>
          <h1 className="text-2xl font-bold text-[#46546A]">
            Chapter {chapter.number}: {chapter.title}
          </h1>
        </div>
      </div>

      {/* Gentle 10-minute session reminder (never terminates or locks) */}
      {sessionElapsedSeconds >= SESSION_TARGET_SECONDS && !dismissedTenMinNote && (
        <div className="rounded-xl bg-[#FFF8DB] border border-[#FFE98A] px-4 py-3 flex items-center justify-between gap-3 text-xs sm:text-sm text-[#46546A]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#C79000] shrink-0" aria-hidden="true" />
            <span>
              You have completed a 10-minute focus session. Feel free to finish this step or pause and continue later.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setDismissedTenMinNote(true)}
            className="text-xs font-semibold text-[#6B5400] hover:underline shrink-0 cursor-pointer"
          >
            Keep going
          </button>
        </div>
      )}

      {/* 6-Step Learning Flow Bar */}
      <nav
        aria-label="Chapter steps"
        className="yr-card rounded-xl p-2 grid grid-cols-3 md:grid-cols-6 gap-1.5"
      >
        {LEARNING_STEPS.map((step) => {
          const isActive = currentStep === step.id;
          const isCompleted = progress.completedSteps.includes(step.id);
          const allowed = canJumpToStep(step.id);
          const shortLabels: Record<LearningStepId, string> = {
            intro: 'Intro',
            examples: 'Examples',
            explore: 'Explore',
            guided: 'Guided',
            independent: 'Practice',
            mastery: 'Mastery',
          };

          return (
            <button
              key={step.id}
              type="button"
              disabled={!allowed}
              title={step.label}
              onClick={() => onSelectStep(step.id)}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-colors flex items-center justify-center gap-1 whitespace-nowrap ${
                isActive
                  ? 'bg-[#795BFF] text-white font-semibold cursor-pointer'
                  : isCompleted
                    ? 'bg-[#EAF9F2] text-[#24A16B] hover:bg-[#DCF4E8] cursor-pointer'
                    : allowed
                      ? 'text-[#46546A] hover:bg-[#F7F9FF] cursor-pointer'
                      : 'text-[#A0AAB8] cursor-not-allowed'
              }`}
            >
              <span className="font-mono-math">{step.number}.</span>
              <span>{shortLabels[step.id]}</span>
            </button>
          );
        })}
      </nav>

      {/* STEP 1: Introduction */}
      {currentStep === 'intro' && (
        <section className="yr-card rounded-2xl p-6 sm:p-8 space-y-5">
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-[#46546A]">
              {chapter.introTitle}
            </h2>
            {chapter.introParagraphs.map((para, idx) => (
              <p key={idx} className="text-sm sm:text-base text-[#46546A] leading-relaxed">
                {para}
              </p>
            ))}
          </div>

          <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-4 space-y-1">
            <div className="text-xs font-semibold text-[#795BFF]">
              Everyday example
            </div>
            <p className="text-sm text-[#6A768C] leading-relaxed">
              {chapter.everydayConnection}
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={() => onCompleteStepAndAdvance('intro', 'examples')}
              className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Worked Examples</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 2: Learn through examples */}
      {currentStep === 'examples' && (
        <section className="space-y-5">
          {chapter.examples.map((ex, idx) => (
            <div key={idx} className="yr-card rounded-2xl p-6 space-y-3">
              <h2 className="text-lg font-bold text-[#46546A]">{ex.title}</h2>
              <p className="text-sm font-medium text-[#795BFF]">{ex.summary}</p>
              <ol className="space-y-2 text-sm text-[#46546A] list-decimal list-inside">
                {ex.steps.map((s, sIdx) => (
                  <li key={sIdx} className="leading-relaxed">
                    {s}
                  </li>
                ))}
              </ol>
              <div className="rounded-xl bg-[#EAF9F2] px-4 py-2.5 text-xs sm:text-sm font-medium text-[#24A16B]">
                Key idea: {ex.takeaway}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onSelectStep('intro')}
              className="text-sm font-medium text-[#7C879C] hover:text-[#46546A] cursor-pointer"
            >
              Back to Introduction
            </button>
            <button
              type="button"
              onClick={() => onCompleteStepAndAdvance('examples', 'explore')}
              className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Explore &amp; Interact</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 3: Explore and interact */}
      {currentStep === 'explore' && (
        <section className="yr-card rounded-2xl p-6 space-y-5">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-[#46546A]">
              Explore and experiment
            </h2>
            <p className="text-sm text-[#6A768C]">{chapter.explorePrompt}</p>
          </div>

          <ChapterInteractiveWidget
            kind={chapter.interactiveKind}
            onInteract={onMarkInteractiveExplored}
          />

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => onSelectStep('examples')}
              className="text-sm font-medium text-[#7C879C] hover:text-[#46546A] cursor-pointer"
            >
              Back to Examples
            </button>
            <button
              type="button"
              onClick={() => onCompleteStepAndAdvance('explore', 'guided')}
              className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Next: Guided Practice</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </section>
      )}

      {/* STEP 4 & STEP 5: Guided Practice & Independent Practice */}
      {activePracticeStep && currentPracticeQ && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2.5 text-sm">
              <span className="font-semibold text-[#46546A]">
                {activePracticeStep === 'guided'
                  ? 'Guided Practice'
                  : 'Independent Practice'}
              </span>
              <span aria-hidden="true" className="text-[#CBD2E1]">
                ·
              </span>
              <span className="font-mono-math text-[#795BFF] font-semibold">
                Question {practiceIndex + 1} of {practiceQuestions.length}
              </span>
              <span aria-hidden="true" className="text-[#CBD2E1]">
                ·
              </span>
              <span className="text-xs text-[#7C879C]">
                {currentPracticeQ.difficulty}
              </span>
            </div>

            <button
              type="button"
              onClick={() => onRequestExtraPractice(activePracticeStep)}
              className="text-xs font-medium text-[#7C879C] hover:text-[#795BFF] inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" aria-hidden="true" />
              <span>Different question</span>
            </button>
          </div>

          <section className="yr-card rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-semibold text-[#46546A] leading-relaxed">
              {currentPracticeQ.questionText}
            </h2>

            <form onSubmit={handlePracticeSubmit} className="space-y-5">
              {renderQuestionInputs(currentPracticeQ, evaluation?.isCorrect === true)}

              {/* Guided support: hint and step-by-step guide */}
              {activePracticeStep === 'guided' && progress.hintRevealed && (
                <div className="rounded-xl bg-[#FFF8DB] border border-[#FFE98A] px-4 py-3 text-sm text-[#46546A] flex items-start gap-2.5">
                  <Lightbulb
                    className="w-4 h-4 text-[#C79000] shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <span className="font-semibold">Hint: </span>
                    <span>{currentPracticeQ.hint}</span>
                  </div>
                </div>
              )}

              {activePracticeStep === 'guided' && showStepSupport && (
                <div className="rounded-xl bg-[#F7F9FF] border border-[#EEF0F5] p-4 space-y-1.5 text-sm text-[#46546A]">
                  <div className="text-xs font-semibold text-[#795BFF]">
                    Step-by-step support
                  </div>
                  <ol className="list-decimal list-inside space-y-1">
                    {currentPracticeQ.stepByStepSupport.map((line, i) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Immediate feedback */}
              {evaluation && (
                <div
                  role="status"
                  className={`rounded-xl border p-4 space-y-2.5 ${
                    evaluation.isCorrect
                      ? 'bg-[#EAF9F2] border-[#BCEAD5] text-[#46546A]'
                      : 'bg-[#F7F9FF] border-[#DCE2F0] text-[#46546A]'
                  }`}
                >
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    {evaluation.isCorrect ? (
                      <CheckCircle2
                        className="w-4 h-4 text-[#24A16B] shrink-0"
                        aria-hidden="true"
                      />
                    ) : (
                      <HelpCircle
                        className="w-4 h-4 text-[#795BFF] shrink-0"
                        aria-hidden="true"
                      />
                    )}
                    <span>{evaluation.feedbackTitle}</span>
                  </div>

                  <p className="text-sm leading-relaxed">
                    {evaluation.feedbackMessage}
                  </p>

                  {!evaluation.isCorrect && (
                    <div className="pt-1">
                      {showExtraExample ? (
                        <div className="rounded-lg bg-white border border-[#EEF0F5] p-3 text-xs text-[#6A768C] space-y-1">
                          <div>
                            <strong className="text-[#46546A]">Correct approach:</strong>{' '}
                            {evaluation.correctApproach}
                          </div>
                          <div>{evaluation.extraExample}</div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setShowExtraExample(true)}
                          className="text-xs font-semibold text-[#795BFF] hover:underline cursor-pointer"
                        >
                          Show worked approach &amp; example
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-3">
                  {activePracticeStep === 'guided' &&
                    evaluation?.isCorrect !== true && (
                      <>
                        {!progress.hintRevealed && (
                          <button
                            type="button"
                            onClick={() =>
                              onShowHint(activePracticeStep, currentPracticeQ)
                            }
                            className="px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium bg-[#FFF8DB] text-[#6B5400] hover:bg-[#FFF0B3] inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Lightbulb className="w-4 h-4" aria-hidden="true" />
                            <span>Show Hint</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setShowStepSupport((v) => !v)}
                          className="text-xs sm:text-sm font-medium text-[#795BFF] hover:underline cursor-pointer"
                        >
                          {showStepSupport ? 'Hide steps' : 'Show step-by-step help'}
                        </button>
                      </>
                    )}
                  <button
                    type="button"
                    onClick={() => onSelectStep('examples')}
                    className="text-xs sm:text-sm font-medium text-[#7C879C] hover:text-[#46546A] cursor-pointer"
                  >
                    Revisit examples
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  {evaluation?.isCorrect === false ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEvaluation(null);
                        onSelectAnswerDraft('');
                      }}
                      className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Try Again</span>
                    </button>
                  ) : evaluation?.isCorrect === true ||
                    practiceCompletedIds.includes(currentPracticeQ.id) ? (
                    practiceIndex < practiceQuestions.length - 1 ? (
                      <button
                        type="button"
                        onClick={() => onAdvancePracticeQuestion(activePracticeStep)}
                        className="yr-btn-primary px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>Next Question</span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          onCompleteStepAndAdvance(
                            activePracticeStep,
                            activePracticeStep === 'guided'
                              ? 'independent'
                              : 'mastery'
                          )
                        }
                        className="yr-btn-primary px-5 py-2.5 rounded-xl font-semibold text-sm inline-flex items-center gap-2 cursor-pointer"
                      >
                        <span>
                          {activePracticeStep === 'guided'
                            ? 'Next: Independent Practice'
                            : 'Start Mastery Check'}
                        </span>
                        <ArrowRight className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )
                  ) : (
                    <button
                      type="submit"
                      disabled={!progress.selectedAnswerDraft.trim()}
                      className="yr-btn-primary px-5 py-2.5 rounded-xl font-semibold text-sm cursor-pointer"
                    >
                      Check Answer
                    </button>
                  )}
                </div>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* STEP 6: Mastery Check */}
      {currentStep === 'mastery' && !masteryFinished && currentMasteryQ && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-sm">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold text-[#46546A]">Mastery Check</span>
              <span aria-hidden="true" className="text-[#CBD2E1]">
                ·
              </span>
              <span className="font-mono-math font-semibold text-[#795BFF]">
                Question {progress.masteryIndex + 1} of {masteryQuestions.length}
              </span>
            </div>
            <span className="text-xs text-[#7C879C]">
              At least {MASTERY_PASS_SCORE} of {masteryQuestions.length} needed to unlock the next chapter
            </span>
          </div>

          <section className="yr-card rounded-2xl p-6 sm:p-7 space-y-5">
            <h2 className="text-lg sm:text-xl font-semibold text-[#46546A] leading-relaxed">
              {currentMasteryQ.questionText}
            </h2>

            <form onSubmit={handleMasterySubmit} className="space-y-5">
              {renderQuestionInputs(currentMasteryQ, false)}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  onClick={onBackHome}
                  className="text-xs sm:text-sm font-medium text-[#7C879C] hover:text-[#46546A] cursor-pointer"
                >
                  Save and pause
                </button>

                <button
                  type="submit"
                  disabled={!progress.selectedAnswerDraft.trim()}
                  className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>
                    {progress.masteryIndex < masteryQuestions.length - 1
                      ? 'Submit & Next'
                      : 'Finish Mastery Check'}
                  </span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* STEP 6: Mastery Check Results */}
      {currentStep === 'mastery' && masteryFinished && latestMasteryResult && (
        <section className="yr-card rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              {latestMasteryResult.passed ? (
                <CheckCircle2
                  className="w-6 h-6 text-[#24A16B] shrink-0"
                  aria-hidden="true"
                />
              ) : (
                <ListChecks
                  className="w-6 h-6 text-[#795BFF] shrink-0"
                  aria-hidden="true"
                />
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-[#46546A]">
                {latestMasteryResult.passed
                  ? `Chapter ${chapter.number} completed`
                  : 'Let us review a few ideas first'}
              </h2>
            </div>

            <p className="text-base text-[#46546A]">
              You scored{' '}
              <strong className="font-mono-math text-[#795BFF]">
                {latestMasteryResult.score} out of {latestMasteryResult.total}
              </strong>
              .{' '}
              {latestMasteryResult.passed
                ? nextChapterTitle
                  ? `${nextChapterTitle} is now unlocked.`
                  : 'You have completed all five chapters in YourRatio.'
                : `At least ${MASTERY_PASS_SCORE} correct answers are needed before unlocking the next chapter.`}
            </p>
          </div>

          {!latestMasteryResult.passed &&
            latestMasteryResult.weakConcepts.length > 0 && (
              <div className="rounded-xl bg-[#FFF8DB] border border-[#FFE98A] p-4 space-y-1.5 text-sm text-[#46546A]">
                <div className="font-semibold">Concepts to practise more:</div>
                <ul className="list-disc list-inside text-sm space-y-0.5">
                  {latestMasteryResult.weakConcepts.map((concept) => (
                    <li key={concept}>{concept}</li>
                  ))}
                </ul>
              </div>
            )}

          {/* Question-by-question review */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[#7C879C]">
              Question summary
            </div>
            <div className="divide-y divide-[#EEF0F5] rounded-xl border border-[#EEF0F5]">
              {progress.masteryAnswers.map((ans: MasteryAnswerRecord, idx: number) => {
                const qObj = masteryQuestions[idx];
                return (
                  <div
                    key={ans.questionId}
                    className="px-4 py-3 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white first:rounded-t-xl last:rounded-b-xl"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium text-[#46546A]">
                        {idx + 1}. {ans.conceptLabel}
                      </div>
                      {!ans.isCorrect && qObj && (
                        <div className="text-xs text-[#6A768C]">
                          {qObj.explanation}
                        </div>
                      )}
                    </div>
                    <span
                      className={`text-xs font-semibold shrink-0 ${
                        ans.isCorrect ? 'text-[#24A16B]' : 'text-[#795BFF]'
                      }`}
                    >
                      {ans.isCorrect ? 'Correct' : 'Needs review'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            {latestMasteryResult.passed ? (
              <>
                <button
                  type="button"
                  onClick={onBackHome}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-[#DCE2F0] text-[#46546A] hover:border-[#795BFF] cursor-pointer"
                >
                  Back to Home
                </button>

                {nextChapterTitle ? (
                  <button
                    type="button"
                    onClick={onOpenNextChapter}
                    className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <span>Continue to {nextChapterTitle}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onBackHome}
                    className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer"
                  >
                    Finish
                  </button>
                )}
              </>
            ) : (
              <div className="flex flex-wrap items-center gap-3 w-full justify-end">
                <button
                  type="button"
                  onClick={() => onSelectStep('examples')}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium bg-white border border-[#DCE2F0] text-[#46546A] hover:border-[#795BFF] inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" aria-hidden="true" />
                  <span>Revisit Examples</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onPracticeWeakConcepts(latestMasteryResult.weakConcepts)
                  }
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#F1EDFF] text-[#795BFF] hover:bg-[#E4DCFF] cursor-pointer"
                >
                  Practise These Concepts
                </button>

                <button
                  type="button"
                  onClick={onRetryMasteryCheck}
                  className="yr-btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" aria-hidden="true" />
                  <span>Retry Mastery Check</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};
