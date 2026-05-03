export type ScoreSnapshot = {
  date: string;
  score: number;
}

const HISTORY_KEY = 'navly_score_history';

export function getScoreHistory(): ScoreSnapshot[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function recordScoreSnapshot(score: number) {
  if (typeof window === 'undefined') return;
  const history = getScoreHistory();
  
  // Only record if the score is > 0 and has actually changed since the last snapshot
  const lastSnapshot = history[history.length - 1];
  
  // Let's cap history at 20 snapshots to prevent localstorage bloat
  if (score > 0 && (!lastSnapshot || lastSnapshot.score !== score)) {
    const snapshot: ScoreSnapshot = { date: new Date().toISOString(), score };
    const newHistory = [...history, snapshot].slice(-20);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  }
}
