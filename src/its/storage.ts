import type { LearnerState } from './types';
import { CHAPTERS, createInitialChapterProgress, getNextChapter } from './chapters';

const STORAGE_KEY = 'yourratio_local_state_v3';

function hasBrowserStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function isValidLearnerState(candidate: unknown): candidate is LearnerState {
  if (!candidate || typeof candidate !== 'object') return false;
  const obj = candidate as Partial<LearnerState>;
  if (!obj.chapters || typeof obj.chapters !== 'object') return false;
  if (!('ch1' in obj.chapters) || !('ch5' in obj.chapters)) return false;
  const ch1 = obj.chapters.ch1 as { currentStep?: unknown } | undefined;
  return Boolean(ch1 && typeof ch1.currentStep === 'string');
}

export function loadLearnerState(): LearnerState | null {
  if (!hasBrowserStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (!isValidLearnerState(parsed)) return null;

    const chapters = { ...parsed.chapters };
    CHAPTERS.forEach((ch, idx) => {
      if (!chapters[ch.id]) {
        chapters[ch.id] = createInitialChapterProgress(
          ch.id,
          idx === 0 ? 'available' : 'locked'
        );
      }
    });

    return {
      ...parsed,
      chapters,
      sessionElapsedSeconds:
        typeof parsed.sessionElapsedSeconds === 'number'
          ? parsed.sessionElapsedSeconds
          : 0,
      totalTimeSpentSeconds:
        typeof parsed.totalTimeSpentSeconds === 'number'
          ? parsed.totalTimeSpentSeconds
          : 0,
      interactionLogs: Array.isArray(parsed.interactionLogs)
        ? parsed.interactionLogs
        : [],
    };
  } catch {
    return null;
  }
}

export function saveLearnerState(state: LearnerState): void {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Ignore browser quota issues
  }
}

export function clearLearnerState(): void {
  if (!hasBrowserStorage()) return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage removal errors
  }
}

/**
 * Rule-based chapter unlocking:
 * If the learner passes a chapter's mastery check (>= 4/5), mark the chapter completed
 * and unlock the next chapter (if currently locked).
 */
export function applyMasteryOutcome(
  state: LearnerState,
  chapterId: string,
  passed: boolean
): { nextState: LearnerState; unlockedChapterId: string | null } {
  const current = state.chapters[chapterId];
  if (!current) {
    return { nextState: state, unlockedChapterId: null };
  }

  const nextChapters = { ...state.chapters };
  let unlockedChapterId: string | null = null;

  if (passed) {
    nextChapters[chapterId] = {
      ...current,
      status: 'completed',
      lastUpdatedAt: new Date().toISOString(),
    };

    const nextChapter = getNextChapter(chapterId);
    if (nextChapter && nextChapters[nextChapter.id]?.status === 'locked') {
      nextChapters[nextChapter.id] = {
        ...nextChapters[nextChapter.id],
        status: 'available',
        lastUpdatedAt: new Date().toISOString(),
      };
      unlockedChapterId = nextChapter.id;
    }
  } else {
    nextChapters[chapterId] = {
      ...current,
      status: current.status === 'completed' ? 'completed' : 'in_progress',
      lastUpdatedAt: new Date().toISOString(),
    };
  }

  return {
    nextState: {
      ...state,
      chapters: nextChapters,
      lastActiveAt: new Date().toISOString(),
    },
    unlockedChapterId,
  };
}
