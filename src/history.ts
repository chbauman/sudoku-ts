// Personal leaderboard: the solve times of finished sudokus, stored locally
// (same storage as the saved game, see storage.ts).
import { storageGet, storageSet } from "./storage.js";

export interface HistoryEntry {
  /** "<level>-<line number in the level file>" */
  id: string;
  level: number;
  seconds: number;
  /** ISO date of the solve */
  date: string;
}

const HISTORY_KEY = "sudoku-ts:history:v1";
const MAX_ENTRIES = 500;

let loading: Promise<HistoryEntry[]> | null = null;

const isEntry = (e: any): e is HistoryEntry =>
  typeof e?.id === "string" &&
  Number.isInteger(e.level) &&
  typeof e.seconds === "number" &&
  typeof e.date === "string";

/** All entries, oldest first (loaded once, then kept in memory) */
export function loadHistory(): Promise<HistoryEntry[]> {
  return (loading ??= (async () => {
    try {
      const raw = await storageGet(HISTORY_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
    } catch (e) {
      return [];
    }
  })());
}

export function bestTime(entries: HistoryEntry[], level: number): number | null {
  const times = entries.filter((e) => e.level === level).map((e) => e.seconds);
  return times.length ? Math.min(...times) : null;
}

/** Stores a finished sudoku, returns the previous best time of its level */
export async function recordSolve(
  entry: HistoryEntry
): Promise<{ previousBest: number | null; isBest: boolean }> {
  const entries = await loadHistory();
  const previousBest = bestTime(entries, entry.level);
  entries.push(entry);
  if (entries.length > MAX_ENTRIES) entries.splice(0, entries.length - MAX_ENTRIES);
  storageSet(HISTORY_KEY, JSON.stringify(entries));
  return {
    previousBest,
    isBest: previousBest === null || entry.seconds < previousBest,
  };
}

/** 83 -> "1:23", 3725 -> "1:02:05" */
export function formatTime(seconds: number): string {
  const s = Math.round(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
