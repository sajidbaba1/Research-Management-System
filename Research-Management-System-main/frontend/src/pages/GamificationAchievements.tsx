import React, { useEffect } from 'react';
import { useGamification } from '../contexts/GamificationContext';

const GamificationAchievements: React.FC = () => {
  const { summary, loading, refresh } = useGamification();

  useEffect(() => { if (!summary) refresh().catch(()=>{}); }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Achievements</h1>
      <p className="text-gray-600 dark:text-gray-400 mt-1">Your badges, points, levels and streaks</p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Points</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{summary?.totalPoints ?? (loading ? '…' : 0)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Level</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{summary?.level ?? (loading ? '…' : 1)}</div>
        </div>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
          <div className="text-sm text-gray-500 dark:text-gray-400">Streak</div>
          <div className="text-2xl font-semibold text-gray-900 dark:text-white">{summary?.currentStreak ?? (loading ? '…' : 0)} days</div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Badges</h2>
          <button onClick={() => refresh()} className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md">Refresh</button>
        </div>
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(summary?.badges?.length ? summary.badges : []).map((b) => (
            <div key={b} className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 p-4 rounded-lg">
              <div className="text-gray-900 dark:text-white font-medium">{b}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Unlocked</div>
            </div>
          ))}
          {(!loading && (!summary?.badges || summary.badges.length === 0)) && (
            <div className="text-gray-600 dark:text-gray-400">No badges yet — keep going!</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GamificationAchievements;
