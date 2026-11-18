import React from 'react';
import { ArrowRight, CheckCircle2, Circle, Lock, PlayCircle } from 'lucide-react';
import type { LearnerState } from '../its/types';
import { CHAPTERS, LEARNING_STEPS, ROBOT_MASCOT_URL } from '../its/chapters';

interface DashboardScreenProps {
  learner: LearnerState;
  onOpenChapter: (chapterId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  learner,
  onOpenChapter,
}) => {
  const completedCount = CHAPTERS.filter(
    (ch) => learner.chapters[ch.id]?.status === 'completed'
  ).length;

  const currentChapter =
    CHAPTERS.find((ch) => ch.id === learner.activeChapterId && learner.chapters[ch.id]?.status !== 'locked') ??
    CHAPTERS.find((ch) => learner.chapters[ch.id]?.status === 'in_progress') ??
    CHAPTERS.find((ch) => learner.chapters[ch.id]?.status === 'available') ??
    CHAPTERS[0];

  const currentProg = learner.chapters[currentChapter.id];
  const hasStartedLearning = CHAPTERS.some(
    (ch) =>
      learner.chapters[ch.id]?.status === 'in_progress' ||
      learner.chapters[ch.id]?.status === 'completed'
  );

  const currentStepInfo = LEARNING_STEPS.find(
    (s) => s.id === (currentProg?.currentStep ?? 'intro')
  );

  const overallPercent = Math.round((completedCount / CHAPTERS.length) * 100);

  return (
    <div className="space-y-8">
      {/* Home Hero: Current Chapter & Continue Learning */}
      <section
        aria-label="Continue learning"
        className="yr-card rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
      >
        <div className="flex items-start sm:items-center gap-4 sm:gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border border-[#EEF0F5] p-1.5 flex items-center justify-center shrink-0 overflow-hidden">
            <img
              src={ROBOT_MASCOT_URL}
              alt="YourRatio mascot"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain mix-blend-multiply"
            />
          </div>

          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-[#795BFF]">
              Current chapter: {currentChapter.number}. {currentChapter.title}
              {currentProg?.status === 'in_progress' && currentStepInfo
                ? ` · Step ${currentStepInfo.number} of 6: ${currentStepInfo.label}`
                : ''}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#46546A] leading-snug text-balance">
              Learn Ratio and Proportion Step by Step
            </h1>
            <p className="text-sm text-[#6A768C] max-w-xl leading-relaxed">
              Work through examples, interactive recipe and map activities, and short mastery checks in focused 10-minute sessions.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onOpenChapter(currentChapter.id)}
          className="yr-btn-primary w-full md:w-auto px-6 py-3 rounded-xl font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 shrink-0 cursor-pointer whitespace-nowrap"
        >
          <span>
            {hasStartedLearning ? 'Continue Learning' : 'Start Chapter 1'}
          </span>
          <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </button>
      </section>

      {/* Simple Overall Progress Bar */}
      <section aria-label="Overall progress" className="yr-card rounded-2xl p-5 space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-[#46546A]">Overall progress</span>
          <span className="font-mono-math font-semibold text-[#795BFF]">
            {completedCount} of {CHAPTERS.length} chapters completed
          </span>
        </div>
        <div className="h-2.5 rounded-full bg-[#EEF0F5] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#795BFF] transition-all duration-300"
            style={{ width: `${Math.max(4, overallPercent)}%` }}
          />
        </div>
      </section>

      {/* 5 Chapter Cards */}
      <section aria-label="Learning chapters" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
          <h2 className="text-lg font-bold text-[#46546A]">Chapters</h2>
          <span className="text-xs text-[#7C879C]">
            Complete each chapter mastery check (4/5) to unlock the next one
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CHAPTERS.map((chapter) => {
            const prog = learner.chapters[chapter.id];
            const status = prog?.status ?? 'locked';
            const isLocked = status === 'locked';
            const isCompleted = status === 'completed';
            const isInProgress = status === 'in_progress';
            const isCurrent = chapter.id === currentChapter.id && !isLocked;

            const statusLabel = isCompleted
              ? 'Completed'
              : isInProgress
                ? 'In Progress'
                : isLocked
                  ? 'Locked'
                  : 'Available';

            const stepInfo = LEARNING_STEPS.find(
              (s) => s.id === (prog?.currentStep ?? 'intro')
            );

            return (
              <article
                key={chapter.id}
                className={`yr-card rounded-2xl p-5 flex flex-col justify-between gap-5 transition-colors ${
                  isLocked
                    ? 'bg-[#FAFBFF] opacity-80'
                    : isCurrent
                      ? 'border-[#B9A9FF]'
                      : 'hover:border-[#B9A9FF]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono-math font-semibold text-[#795BFF]">
                      Chapter {chapter.number}
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 font-semibold ${
                        isCompleted
                          ? 'text-[#24A16B]'
                          : isInProgress
                            ? 'text-[#795BFF]'
                            : isLocked
                              ? 'text-[#8C96AA]'
                              : 'text-[#42C5E8]'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : isInProgress ? (
                        <PlayCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      ) : (
                        <Circle className="w-3 h-3" aria-hidden="true" />
                      )}
                      <span>{statusLabel}</span>
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-base font-bold text-[#46546A] leading-snug">
                      {chapter.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#6A768C] leading-relaxed">
                      {chapter.shortSubtitle}
                    </p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {isInProgress && stepInfo && (
                    <div className="text-xs text-[#795BFF] font-medium">
                      Stopped at Step {stepInfo.number}: {stepInfo.label}
                    </div>
                  )}

                  {isLocked ? (
                    <div className="rounded-xl bg-[#F2F4FA] px-3.5 py-2.5 text-xs text-[#6A768C] flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-[#8C96AA] shrink-0" aria-hidden="true" />
                      <span>Complete the previous chapter to unlock this one.</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpenChapter(chapter.id)}
                      aria-label={`${
                        isCompleted
                          ? 'Revisit'
                          : isInProgress
                            ? 'Continue'
                            : 'Start'
                      } ${chapter.title}`}
                      className={`w-full py-2.5 px-4 rounded-xl text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap ${
                        isCompleted
                          ? 'bg-[#EAF9F2] text-[#24A16B] hover:bg-[#DCF4E8]'
                          : isCurrent || isInProgress
                            ? 'yr-btn-primary'
                            : 'bg-[#F1EDFF] text-[#795BFF] hover:bg-[#E4DCFF]'
                      }`}
                    >
                      <span>
                        {isCompleted
                          ? 'Revisit Chapter'
                          : isInProgress
                            ? 'Continue Chapter'
                            : 'Start Chapter'}
                      </span>
                      <ArrowRight className="w-4 h-4" aria-hidden="true" />
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
};
