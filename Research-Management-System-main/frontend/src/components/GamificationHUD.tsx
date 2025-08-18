import React from 'react';
import { useGamification } from '../contexts/GamificationContext';

const GamificationHUD: React.FC = () => {
  const { summary, loading } = useGamification();

  if (loading || !summary) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xl rounded-xl px-4 py-3 min-w-[220px]">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Points</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{summary.totalPoints}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Level</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{summary.level}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Streak</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">{summary.currentStreak}d</div>
          </div>
        </div>
        {summary.badges?.length ? (
          <div className="mt-2 text-xs text-gray-600 dark:text-gray-300 truncate" title={summary.badges.join(', ')}>
            Badges: {summary.badges.join(', ')}
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default GamificationHUD;
