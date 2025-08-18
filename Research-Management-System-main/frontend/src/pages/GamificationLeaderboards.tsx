import React, { useEffect, useState } from 'react';
import { getLeaderboard, LeaderboardEntry } from '../api/gamification';

const GamificationLeaderboards: React.FC = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const load = async (p: 'weekly' | 'monthly') => {
    try {
      setLoading(true);
      setError('');
      const res = await getLeaderboard(p);
      setData(res);
    } catch (e) {
      setError('Failed to load leaderboard');
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(period); }, [period]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leaderboards</h1>
          <p className="text-gray-600 dark:text-gray-400">See top contributors</p>
        </div>
        <div className="space-x-2">
          <button onClick={() => setPeriod('weekly')} className={`px-3 py-1 rounded-md text-sm ${period==='weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}>Weekly</button>
          <button onClick={() => setPeriod('monthly')} className={`px-3 py-1 rounded-md text-sm ${period==='monthly' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-slate-700 text-gray-800 dark:text-gray-200'}`}>Monthly</button>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
        {loading && <div className="p-4 text-gray-600 dark:text-gray-400">Loading…</div>}
        {error && <div className="p-4 text-red-600 dark:text-red-400">{error}</div>}
        {!loading && !error && (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
            <thead className="bg-gray-50 dark:bg-slate-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Points</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
              {data.map((row, idx) => (
                <tr key={`${row.userId}-${idx}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">#{idx+1}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">User {row.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{row.points}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">No data yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default GamificationLeaderboards;
