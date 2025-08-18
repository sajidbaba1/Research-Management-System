const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export interface GamificationSummary {
  userId: number;
  totalPoints: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  badges: string[];
}

export async function getSummary(userId: number): Promise<GamificationSummary> {
  const res = await fetch(`${API_URL}/api/gamification/summary?userId=${userId}`);
  if (!res.ok) throw new Error('Failed to load gamification summary');
  return res.json();
}

export async function recordEvent(userId: number, eventType: string): Promise<number> {
  const res = await fetch(`${API_URL}/api/gamification/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, eventType })
  });
  if (!res.ok) throw new Error('Failed to record event');
  return res.json();
}

export interface LeaderboardEntry { userId: number; points: number; }

export async function getLeaderboard(period: 'weekly' | 'monthly'): Promise<LeaderboardEntry[]> {
  const res = await fetch(`${API_URL}/api/gamification/leaderboard?period=${period}`);
  if (!res.ok) throw new Error('Failed to load leaderboard');
  return res.json();
}
