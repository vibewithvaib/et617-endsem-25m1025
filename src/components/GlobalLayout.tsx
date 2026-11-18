import React from 'react';
import { Clock, Download, GraduationCap, Home, RotateCcw } from 'lucide-react';
import type { LearnerState, ScreenName } from '../its/types';
import { SESSION_TARGET_SECONDS } from '../its/chapters';

interface GlobalLayoutProps {
  learner: LearnerState;
  currentScreen: ScreenName;
  onGoHome: () => void;
  onCollectLogs: () => void;
  onResetProgress: () => void;
  logNotice: string | null;
  children: React.ReactNode;
}

export function formatSessionClock(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const GlobalLayout: React.FC<GlobalLayoutProps> = ({
  learner,
  currentScreen,
  onGoHome,
  onCollectLogs,
  onResetProgress,
  logNotice,
  children,
}) => {
  const elapsed = learner.sessionElapsedSeconds;
  const remaining = Math.max(0, SESSION_TARGET_SECONDS - elapsed);

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FF] text-[#46546A]">
      <header className="sticky top-0 z-30 bg-white border-b border-[#EEF0F5]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onGoHome}
            className="flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-[#795BFF] rounded-xl cursor-pointer"
          >
            <span className="w-9 h-9 rounded-xl bg-[#795BFF] text-white flex items-center justify-center">
              <GraduationCap className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-xl font-bold tracking-tight whitespace-nowrap">
              <span className="text-[#795BFF]">Your</span>
              <span className="text-[#42C5E8]">Ratio</span>
            </span>
          </button>

          <nav aria-label="Main navigation" className="flex items-center gap-6 text-sm font-medium">
            <button
              type="button"
              onClick={onGoHome}
              className={`flex items-center gap-1.5 py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                currentScreen === 'home'
                  ? 'border-[#795BFF] text-[#795BFF] font-semibold'
                  : 'border-transparent text-[#6A768C] hover:text-[#46546A]'
              }`}
            >
              <Home className="w-4 h-4" aria-hidden="true" />
              <span>Home</span>
            </button>
          </nav>

          <div className="flex items-center gap-3 shrink-0">
            <div
              className="flex items-center gap-1.5 text-xs font-medium text-[#6A768C] font-mono-math whitespace-nowrap"
              title="Suggested 10-minute focus session"
            >
              <Clock className="w-3.5 h-3.5 text-[#795BFF]" aria-hidden="true" />
              <span>
                {elapsed < SESSION_TARGET_SECONDS
                  ? `${formatSessionClock(remaining)} left`
                  : `${formatSessionClock(elapsed)}`}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {logNotice && (
          <div
            role="status"
            className="mb-5 rounded-xl bg-[#EAF9F2] border border-[#BCEAD5] px-4 py-3 text-sm text-[#24A16B] font-medium"
          >
            {logNotice}
          </div>
        )}
        {children}
      </main>

      <footer className="bg-white border-t border-[#EEF0F5] mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#7C879C]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-[#46546A]">
              <span className="text-[#795BFF]">Your</span>
              <span className="text-[#42C5E8]">Ratio</span>
            </span>
            <span aria-hidden="true">·</span>
            <span>Ratio and proportion practice through recipes and maps</span>
          </div>

          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={onCollectLogs}
              className="text-xs font-medium text-[#6A768C] hover:text-[#795BFF] inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5 text-[#42C5E8]" aria-hidden="true" />
              <span>Collect Interaction Logs</span>
            </button>

            <button
              type="button"
              onClick={onResetProgress}
              className="text-xs font-medium text-[#7C879C] hover:text-[#46546A] inline-flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3 h-3" aria-hidden="true" />
              <span>Reset Progress</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
