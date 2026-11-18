import type {
  InteractionLogEntry,
  LearnerState,
  LearningStepId,
  QuestionType,
} from './types';
import { CHAPTERS } from './chapters';

export interface CreateInteractionLogParams {
  chapterId: string;
  activity: string;
  step?: LearningStepId | null;
  questionId?: string | null;
  questionText?: string | null;
  questionType?: QuestionType | null;
  learnerAnswer?: string | null;
  isCorrect?: boolean | null;
  attemptNumber?: number | null;
  hintsUsed?: number;
  timeSpentSeconds: number;
  masteryScore?: string | null;
  unlockedChapterId?: string | null;
}

export function createInteractionLog(
  params: CreateInteractionLogParams
): InteractionLogEntry {
  return {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    chapterId: params.chapterId,
    activity: params.activity,
    step: params.step ?? null,
    questionId: params.questionId ?? null,
    questionText: params.questionText ?? null,
    questionType: params.questionType ?? null,
    learnerAnswer: params.learnerAnswer ?? null,
    isCorrect: params.isCorrect ?? null,
    attemptNumber: params.attemptNumber ?? null,
    hintsUsed: params.hintsUsed ?? 0,
    timeSpentSeconds: Math.max(0, Math.round(params.timeSpentSeconds)),
    masteryScore: params.masteryScore ?? null,
    unlockedChapterId: params.unlockedChapterId ?? null,
  };
}

export function appendInteractionLog(
  existing: InteractionLogEntry[],
  entry: InteractionLogEntry
): InteractionLogEntry[] {
  const prev = existing[existing.length - 1];
  if (prev) {
    const dt = Math.abs(
      new Date(entry.timestamp).getTime() - new Date(prev.timestamp).getTime()
    );
    const sameEvent =
      prev.chapterId === entry.chapterId &&
      prev.activity === entry.activity &&
      prev.step === entry.step &&
      prev.questionId === entry.questionId &&
      prev.learnerAnswer === entry.learnerAnswer;
    if (sameEvent && dt < 600) {
      return existing;
    }
  }
  return [...existing, entry];
}

export interface InteractionLogExport {
  application: string;
  exportedAt: string;
  totalTimeSpentSeconds: number;
  sessionElapsedSeconds: number;
  chapters: {
    chapterId: string;
    title: string;
    status: string;
    currentStep: string;
    timeSpentSeconds: number;
    masteryHistory: {
      attemptNumber: number;
      score: number;
      total: number;
      passed: boolean;
      weakConcepts: string[];
      completedAt: string;
    }[];
  }[];
  summary: {
    chaptersCompleted: number;
    questionsPresented: number;
    correctAttempts: number;
    incorrectAttempts: number;
    hintsUsed: number;
    masteryChecksCompleted: number;
  };
  interactions: InteractionLogEntry[];
}

export function buildInteractionLogExport(
  state: LearnerState
): InteractionLogExport {
  const chapterSummary = CHAPTERS.map((ch) => {
    const prog = state.chapters[ch.id];
    return {
      chapterId: ch.id,
      title: ch.title,
      status: prog?.status ?? 'locked',
      currentStep: prog?.currentStep ?? 'intro',
      timeSpentSeconds: prog?.timeSpentSeconds ?? 0,
      masteryHistory: prog?.masteryHistory ?? [],
    };
  });

  const answerLogs = state.interactionLogs.filter(
    (entry) => entry.activity === 'answer_submitted' || entry.activity === 'mastery_answer'
  );
  const presentedLogs = state.interactionLogs.filter(
    (entry) => entry.activity === 'question_presented'
  );
  const masteryLogs = state.interactionLogs.filter(
    (entry) => entry.activity === 'mastery_completed'
  );

  return {
    application: 'YourRatio',
    exportedAt: new Date().toISOString(),
    totalTimeSpentSeconds: state.totalTimeSpentSeconds,
    sessionElapsedSeconds: state.sessionElapsedSeconds,
    chapters: chapterSummary,
    summary: {
      chaptersCompleted: chapterSummary.filter((c) => c.status === 'completed').length,
      questionsPresented: presentedLogs.length,
      correctAttempts: answerLogs.filter((l) => l.isCorrect === true).length,
      incorrectAttempts: answerLogs.filter((l) => l.isCorrect === false).length,
      hintsUsed: state.interactionLogs.reduce((s, e) => s + (e.hintsUsed ?? 0), 0),
      masteryChecksCompleted: masteryLogs.length,
    },
    interactions: state.interactionLogs,
  };
}

export function downloadInteractionLogsJson(
  state: LearnerState
): InteractionLogExport {
  const payload = buildInteractionLogExport(state);
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'YourRatio_InteractionLogs.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return payload;
}
