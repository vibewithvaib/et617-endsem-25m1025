export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';

export type QuestionType = 'mcq' | 'fill_blank' | 'numerical' | 'short_answer';

export type ChapterStatus = 'locked' | 'available' | 'in_progress' | 'completed';

export type LearningStepId =
  | 'intro'
  | 'examples'
  | 'explore'
  | 'guided'
  | 'independent'
  | 'mastery';

export type ScreenName = 'home' | 'chapter';

export type InteractiveKind =
  | 'ratio_compare'
  | 'equivalent_scaler'
  | 'recipe_mixer'
  | 'map_ruler'
  | 'challenge_review';

export interface QuestionOption {
  id: string;
  label: string;
  value: string;
  mistakeHint?: string;
}

export interface MathCheckSpec {
  kind: 'scale_pair' | 'missing_value' | 'simplify_ratio' | 'map_distance';
  a: number;
  b: number;
  factor?: number;
}

export interface PracticeQuestion {
  id: string;
  chapterId: string;
  conceptTag: string;
  conceptLabel: string;
  questionText: string;
  questionType: QuestionType;
  difficulty: DifficultyLevel;
  options?: QuestionOption[];
  correctAnswer: string;
  acceptableAnswers?: string[];
  expectedKeywords?: string[];
  unitLabel?: string;
  explanation: string;
  hint: string;
  stepByStepSupport: string[];
  extraExample: string;
  mathCheck?: MathCheckSpec;
  source: 'generated' | 'prepared';
}

export interface ChapterExample {
  title: string;
  summary: string;
  steps: string[];
  takeaway: string;
}

export interface ChapterDefinition {
  id: string;
  number: number;
  title: string;
  shortSubtitle: string;
  introTitle: string;
  introParagraphs: string[];
  everydayConnection: string;
  examples: ChapterExample[];
  explorePrompt: string;
  interactiveKind: InteractiveKind;
}

export interface MasteryAnswerRecord {
  questionId: string;
  conceptTag: string;
  conceptLabel: string;
  learnerAnswer: string;
  isCorrect: boolean;
}

export interface MasteryResult {
  attemptNumber: number;
  score: number;
  total: number;
  passed: boolean;
  weakConcepts: string[];
  completedAt: string;
}

export interface ChapterProgress {
  chapterId: string;
  status: ChapterStatus;
  currentStep: LearningStepId;
  completedSteps: LearningStepId[];
  exploredInteractive: boolean;
  guidedQuestions: PracticeQuestion[];
  guidedIndex: number;
  guidedCompletedIds: string[];
  independentQuestions: PracticeQuestion[];
  independentIndex: number;
  independentCompletedIds: string[];
  masteryQuestions: PracticeQuestion[];
  masteryIndex: number;
  masteryAnswers: MasteryAnswerRecord[];
  masteryHistory: MasteryResult[];
  selectedAnswerDraft: string;
  hintRevealed: boolean;
  attemptsOnCurrent: number;
  weakConcepts: string[];
  timeSpentSeconds: number;
  lastUpdatedAt: string;
}

export interface InteractionLogEntry {
  id: string;
  timestamp: string;
  chapterId: string;
  activity: string;
  step: LearningStepId | null;
  questionId: string | null;
  questionText: string | null;
  questionType: QuestionType | null;
  learnerAnswer: string | null;
  isCorrect: boolean | null;
  attemptNumber: number | null;
  hintsUsed: number;
  timeSpentSeconds: number;
  masteryScore: string | null;
  unlockedChapterId: string | null;
}

export interface LearnerState {
  learnerId: string;
  activeChapterId: string;
  chapters: Record<string, ChapterProgress>;
  sessionElapsedSeconds: number;
  totalTimeSpentSeconds: number;
  interactionLogs: InteractionLogEntry[];
  lastActiveAt: string;
}
