import { useCallback, useEffect, useState } from 'react';
import type {
  LearnerState,
  LearningStepId,
  MasteryAnswerRecord,
  PracticeQuestion,
  ScreenName,
} from './its/types';
import {
  CHAPTERS,
  MASTERY_PASS_SCORE,
  createInitialLearnerState,
  getChapterById,
  getNextChapter,
} from './its/chapters';
import {
  applyMasteryOutcome,
  clearLearnerState,
  loadLearnerState,
  saveLearnerState,
} from './its/storage';
import {
  buildGuidedPracticeSet,
  buildIndependentPracticeSet,
  buildMasteryCheckSet,
  generateLocalQuestion,
} from './its/questionGenerator';
import {
  appendInteractionLog,
  createInteractionLog,
  downloadInteractionLogsJson,
} from './its/logger';
import { GlobalLayout } from './components/GlobalLayout';
import { DashboardScreen } from './components/DashboardScreen';
import { ChapterView } from './components/ChapterView';

export default function App() {
  const [learner, setLearner] = useState<LearnerState>(() => {
    const saved = loadLearnerState();
    return saved ?? createInitialLearnerState();
  });
  const [currentScreen, setCurrentScreen] = useState<ScreenName>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        return 'home';
      }
    }
    return 'home';
  });
  const [logNotice, setLogNotice] = useState<string | null>(null);

  const persistState = useCallback((next: LearnerState) => {
    setLearner(next);
    saveLearnerState(next);
  }, []);

  // Track 10-minute focus session time quietly while inside a chapter
  useEffect(() => {
    if (currentScreen !== 'chapter') return;
    const interval = setInterval(() => {
      setLearner((prev) => {
        const ch = prev.chapters[prev.activeChapterId];
        if (!ch) return prev;
        const next: LearnerState = {
          ...prev,
          sessionElapsedSeconds: prev.sessionElapsedSeconds + 1,
          totalTimeSpentSeconds: prev.totalTimeSpentSeconds + 1,
          chapters: {
            ...prev.chapters,
            [ch.chapterId]: {
              ...ch,
              timeSpentSeconds: ch.timeSpentSeconds + 1,
            },
          },
        };
        if (next.sessionElapsedSeconds % 5 === 0) {
          saveLearnerState(next);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentScreen]);

  const ensureChapterQuestionsReady = (
    state: LearnerState,
    chapterId: string
  ): LearnerState => {
    const ch = state.chapters[chapterId];
    if (!ch) return state;

    const guided =
      ch.guidedQuestions.length > 0
        ? ch.guidedQuestions
        : buildGuidedPracticeSet(chapterId, ch.weakConcepts);
    const independent =
      ch.independentQuestions.length > 0
        ? ch.independentQuestions
        : buildIndependentPracticeSet(chapterId, ch.weakConcepts);
    const mastery =
      ch.masteryQuestions.length > 0
        ? ch.masteryQuestions
        : buildMasteryCheckSet(chapterId, ch.masteryHistory.length, ch.weakConcepts);

    return {
      ...state,
      chapters: {
        ...state.chapters,
        [chapterId]: {
          ...ch,
          guidedQuestions: guided,
          independentQuestions: independent,
          masteryQuestions: mastery,
        },
      },
    };
  };

  const handleOpenChapter = (chapterId: string) => {
    const ch = learner.chapters[chapterId];
    if (!ch || ch.status === 'locked') {
      return;
    }

    const withQuestions = ensureChapterQuestionsReady(learner, chapterId);
    const current = withQuestions.chapters[chapterId];
    const nextStatus = current.status === 'available' ? 'in_progress' : current.status;

    const log = createInteractionLog({
      chapterId,
      activity: 'chapter_opened',
      step: current.currentStep,
      timeSpentSeconds: current.timeSpentSeconds,
    });

    const next: LearnerState = {
      ...withQuestions,
      activeChapterId: chapterId,
      chapters: {
        ...withQuestions.chapters,
        [chapterId]: {
          ...current,
          status: nextStatus,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: appendInteractionLog(withQuestions.interactionLogs, log),
      lastActiveAt: new Date().toISOString(),
    };

    persistState(next);
    setCurrentScreen('chapter');
  };

  const handleGoHome = () => {
    saveLearnerState(learner);
    setCurrentScreen('home');
  };

  const handleSelectStep = (step: LearningStepId) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const log = createInteractionLog({
      chapterId: chId,
      activity: 'step_visited',
      step,
      timeSpentSeconds: ch.timeSpentSeconds,
    });

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          currentStep: step,
          selectedAnswerDraft: '',
          hintRevealed: false,
          attemptsOnCurrent: 0,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: appendInteractionLog(learner.interactionLogs, log),
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleCompleteStepAndAdvance = (
    fromStep: LearningStepId,
    toStep: LearningStepId
  ) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const completedSteps = ch.completedSteps.includes(fromStep)
      ? ch.completedSteps
      : [...ch.completedSteps, fromStep];

    let nextLogs = learner.interactionLogs;
    if (toStep === 'guided' && ch.guidedQuestions[0]) {
      const q = ch.guidedQuestions[ch.guidedIndex] ?? ch.guidedQuestions[0];
      nextLogs = appendInteractionLog(
        nextLogs,
        createInteractionLog({
          chapterId: chId,
          activity: 'question_presented',
          step: 'guided',
          questionId: q.id,
          questionText: q.questionText,
          questionType: q.questionType,
          timeSpentSeconds: ch.timeSpentSeconds,
        })
      );
    }

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          completedSteps,
          currentStep: toStep,
          selectedAnswerDraft: '',
          hintRevealed: false,
          attemptsOnCurrent: 0,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: nextLogs,
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleMarkInteractiveExplored = () => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const log = !ch.exploredInteractive
      ? createInteractionLog({
          chapterId: chId,
          activity: 'interactive_explored',
          step: 'explore',
          timeSpentSeconds: ch.timeSpentSeconds,
        })
      : null;

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          exploredInteractive: true,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: log
        ? appendInteractionLog(learner.interactionLogs, log)
        : learner.interactionLogs,
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleSelectAnswerDraft = (answer: string) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    setLearner({
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          selectedAnswerDraft: answer,
        },
      },
    });
  };

  const handleShowHint = (
    step: 'guided' | 'independent',
    question: PracticeQuestion
  ) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch || ch.hintRevealed) return;

    const log = createInteractionLog({
      chapterId: chId,
      activity: 'hint_used',
      step,
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      hintsUsed: 1,
      timeSpentSeconds: ch.timeSpentSeconds,
    });

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          hintRevealed: true,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: appendInteractionLog(learner.interactionLogs, log),
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleSubmitPracticeAnswer = (
    step: 'guided' | 'independent',
    question: PracticeQuestion,
    answer: string,
    isCorrect: boolean,
    attemptNumber: number
  ) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const completedIds =
      step === 'guided' ? ch.guidedCompletedIds : ch.independentCompletedIds;
    const updatedCompleted =
      isCorrect && !completedIds.includes(question.id)
        ? [...completedIds, question.id]
        : completedIds;

    const weakConcepts = !isCorrect
      ? Array.from(new Set([...ch.weakConcepts, question.conceptTag]))
      : ch.weakConcepts;

    const log = createInteractionLog({
      chapterId: chId,
      activity: 'answer_submitted',
      step,
      questionId: question.id,
      questionText: question.questionText,
      questionType: question.questionType,
      learnerAnswer: answer,
      isCorrect,
      attemptNumber,
      hintsUsed: ch.hintRevealed ? 1 : 0,
      timeSpentSeconds: ch.timeSpentSeconds,
    });

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          ...(step === 'guided'
            ? { guidedCompletedIds: updatedCompleted }
            : { independentCompletedIds: updatedCompleted }),
          selectedAnswerDraft: answer,
          attemptsOnCurrent: attemptNumber,
          weakConcepts,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: appendInteractionLog(learner.interactionLogs, log),
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleAdvancePracticeQuestion = (step: 'guided' | 'independent') => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const list = step === 'guided' ? ch.guidedQuestions : ch.independentQuestions;
    const currentIndex = step === 'guided' ? ch.guidedIndex : ch.independentIndex;
    const nextIndex = Math.min(list.length - 1, currentIndex + 1);
    const nextQ = list[nextIndex];

    const nextLogs = nextQ
      ? appendInteractionLog(
          learner.interactionLogs,
          createInteractionLog({
            chapterId: chId,
            activity: 'question_presented',
            step,
            questionId: nextQ.id,
            questionText: nextQ.questionText,
            questionType: nextQ.questionType,
            timeSpentSeconds: ch.timeSpentSeconds,
          })
        )
      : learner.interactionLogs;

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          ...(step === 'guided'
            ? { guidedIndex: nextIndex }
            : { independentIndex: nextIndex }),
          selectedAnswerDraft: '',
          hintRevealed: false,
          attemptsOnCurrent: 0,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: nextLogs,
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleRequestExtraPractice = (step: 'guided' | 'independent') => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const list = step === 'guided' ? ch.guidedQuestions : ch.independentQuestions;
    const idx = step === 'guided' ? ch.guidedIndex : ch.independentIndex;
    const currentQ = list[idx];
    if (!currentQ) return;

    const freshQ = generateLocalQuestion({
      chapterId: chId,
      difficulty: currentQ.difficulty,
      preferredType: currentQ.questionType,
      preferredConcept: ch.weakConcepts[0] ?? currentQ.conceptTag,
      recentQuestionTexts: list.map((q) => q.questionText),
      seedOffset: Math.floor(Math.random() * 80) + idx + 5,
    });

    const updatedList = list.map((q, i) => (i === idx ? freshQ : q));
    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          ...(step === 'guided'
            ? { guidedQuestions: updatedList }
            : { independentQuestions: updatedList }),
          selectedAnswerDraft: '',
          hintRevealed: false,
          attemptsOnCurrent: 0,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleSubmitMasteryAnswer = (
    question: PracticeQuestion,
    answer: string,
    isCorrect: boolean
  ) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const record: MasteryAnswerRecord = {
      questionId: question.id,
      conceptTag: question.conceptTag,
      conceptLabel: question.conceptLabel,
      learnerAnswer: answer,
      isCorrect,
    };

    const updatedAnswers = [...ch.masteryAnswers, record];
    const finished = updatedAnswers.length >= ch.masteryQuestions.length;

    let nextLogs = appendInteractionLog(
      learner.interactionLogs,
      createInteractionLog({
        chapterId: chId,
        activity: 'mastery_answer',
        step: 'mastery',
        questionId: question.id,
        questionText: question.questionText,
        questionType: question.questionType,
        learnerAnswer: answer,
        isCorrect,
        attemptNumber: ch.masteryHistory.length + 1,
        timeSpentSeconds: ch.timeSpentSeconds,
      })
    );

    if (!finished) {
      const next: LearnerState = {
        ...learner,
        chapters: {
          ...learner.chapters,
          [chId]: {
            ...ch,
            masteryAnswers: updatedAnswers,
            masteryIndex: ch.masteryIndex + 1,
            selectedAnswerDraft: '',
            lastUpdatedAt: new Date().toISOString(),
          },
        },
        interactionLogs: nextLogs,
        lastActiveAt: new Date().toISOString(),
      };
      persistState(next);
      return;
    }

    const score = updatedAnswers.filter((a) => a.isCorrect).length;
    const total = ch.masteryQuestions.length;
    const passed = score >= MASTERY_PASS_SCORE;
    const weakConceptLabels = Array.from(
      new Set(
        updatedAnswers.filter((a) => !a.isCorrect).map((a) => a.conceptLabel)
      )
    );
    const weakConceptTags = Array.from(
      new Set(
        updatedAnswers.filter((a) => !a.isCorrect).map((a) => a.conceptTag)
      )
    );

    const newResult = {
      attemptNumber: ch.masteryHistory.length + 1,
      score,
      total,
      passed,
      weakConcepts: weakConceptLabels,
      completedAt: new Date().toISOString(),
    };

    const completedSteps =
      passed && !ch.completedSteps.includes('mastery')
        ? [...ch.completedSteps, 'mastery' as const]
        : ch.completedSteps;

    const stateWithResult: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          completedSteps,
          masteryAnswers: updatedAnswers,
          masteryHistory: [...ch.masteryHistory, newResult],
          weakConcepts: weakConceptTags,
          selectedAnswerDraft: '',
          lastUpdatedAt: new Date().toISOString(),
        },
      },
    };

    const { nextState, unlockedChapterId } = applyMasteryOutcome(
      stateWithResult,
      chId,
      passed
    );

    nextLogs = appendInteractionLog(
      nextLogs,
      createInteractionLog({
        chapterId: chId,
        activity: 'mastery_completed',
        step: 'mastery',
        masteryScore: `${score}/${total}`,
        unlockedChapterId,
        timeSpentSeconds: ch.timeSpentSeconds,
      })
    );

    persistState({
      ...nextState,
      interactionLogs: nextLogs,
    });
  };

  const handlePracticeWeakConcepts = (weakConceptLabels: string[]) => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const freshGuided = buildGuidedPracticeSet(chId, ch.weakConcepts);
    const log = createInteractionLog({
      chapterId: chId,
      activity: 'extra_practice_started',
      step: 'guided',
      learnerAnswer: weakConceptLabels.join(', '),
      timeSpentSeconds: ch.timeSpentSeconds,
    });

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          currentStep: 'guided',
          guidedQuestions: freshGuided,
          guidedIndex: 0,
          guidedCompletedIds: [],
          selectedAnswerDraft: '',
          hintRevealed: false,
          attemptsOnCurrent: 0,
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: appendInteractionLog(learner.interactionLogs, log),
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleRetryMasteryCheck = () => {
    const chId = learner.activeChapterId;
    const ch = learner.chapters[chId];
    if (!ch) return;

    const freshMastery = buildMasteryCheckSet(
      chId,
      ch.masteryHistory.length + 1,
      ch.weakConcepts
    );

    const log = createInteractionLog({
      chapterId: chId,
      activity: 'mastery_retry_started',
      step: 'mastery',
      timeSpentSeconds: ch.timeSpentSeconds,
    });

    const next: LearnerState = {
      ...learner,
      chapters: {
        ...learner.chapters,
        [chId]: {
          ...ch,
          currentStep: 'mastery',
          masteryQuestions: freshMastery,
          masteryIndex: 0,
          masteryAnswers: [],
          selectedAnswerDraft: '',
          lastUpdatedAt: new Date().toISOString(),
        },
      },
      interactionLogs: appendInteractionLog(learner.interactionLogs, log),
      lastActiveAt: new Date().toISOString(),
    };
    persistState(next);
  };

  const handleCollectLogs = () => {
    const report = downloadInteractionLogsJson(learner);
    setLogNotice(
      `Downloaded YourRatio_InteractionLogs.json (${report.interactions.length} recorded events).`
    );
    setTimeout(() => setLogNotice(null), 5000);
  };

  const handleResetProgress = () => {
    clearLearnerState();
    const fresh = createInitialLearnerState();
    persistState(fresh);
    setCurrentScreen('home');
  };

  const activeChapter = getChapterById(learner.activeChapterId);
  const nextChapter = getNextChapter(activeChapter.id);
  const readyState = ensureChapterQuestionsReady(learner, activeChapter.id);
  const activeProgress =
    readyState.chapters[activeChapter.id] ?? CHAPTERS[0];

  return (
    <GlobalLayout
      learner={learner}
      currentScreen={currentScreen}
      onGoHome={handleGoHome}
      onCollectLogs={handleCollectLogs}
      onResetProgress={handleResetProgress}
      logNotice={logNotice}
    >
      {currentScreen === 'home' && (
        <DashboardScreen learner={learner} onOpenChapter={handleOpenChapter} />
      )}

      {currentScreen === 'chapter' && (
        <ChapterView
          chapter={activeChapter}
          progress={activeProgress}
          nextChapterTitle={nextChapter ? nextChapter.title : null}
          sessionElapsedSeconds={learner.sessionElapsedSeconds}
          onBackHome={handleGoHome}
          onSelectStep={handleSelectStep}
          onCompleteStepAndAdvance={handleCompleteStepAndAdvance}
          onMarkInteractiveExplored={handleMarkInteractiveExplored}
          onSelectAnswerDraft={handleSelectAnswerDraft}
          onShowHint={handleShowHint}
          onSubmitPracticeAnswer={handleSubmitPracticeAnswer}
          onAdvancePracticeQuestion={handleAdvancePracticeQuestion}
          onRequestExtraPractice={handleRequestExtraPractice}
          onSubmitMasteryAnswer={handleSubmitMasteryAnswer}
          onPracticeWeakConcepts={handlePracticeWeakConcepts}
          onRetryMasteryCheck={handleRetryMasteryCheck}
          onOpenNextChapter={() => {
            if (nextChapter) {
              handleOpenChapter(nextChapter.id);
            } else {
              handleGoHome();
            }
          }}
        />
      )}
    </GlobalLayout>
  );
}
