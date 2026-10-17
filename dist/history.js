import { storageGet, storageSet } from "./storage.js";
const HISTORY_KEY = "sudoku-ts:history:v1";
const MAX_ENTRIES = 500;
let loading = null;
const isEntry = (e) => typeof e?.id === "string" &&
    Number.isInteger(e.level) &&
    (e.puzzle === undefined || typeof e.puzzle === "string") &&
    typeof e.seconds === "number" &&
    typeof e.date === "string";
export function loadHistory() {
    return (loading ?? (loading = (async () => {
        try {
            const raw = await storageGet(HISTORY_KEY);
            const parsed = raw ? JSON.parse(raw) : [];
            return Array.isArray(parsed) ? parsed.filter(isEntry) : [];
        }
        catch (e) {
            return [];
        }
    })()));
}
export function bestTime(entries, level) {
    const times = entries.filter((e) => e.level === level).map((e) => e.seconds);
    return times.length ? Math.min(...times) : null;
}
export async function recordSolve(entry) {
    const entries = await loadHistory();
    const previousBest = bestTime(entries, entry.level);
    entries.push(entry);
    if (entries.length > MAX_ENTRIES)
        entries.splice(0, entries.length - MAX_ENTRIES);
    storageSet(HISTORY_KEY, JSON.stringify(entries));
    return {
        previousBest,
        isBest: previousBest === null || entry.seconds < previousBest,
    };
}
export function formatTime(seconds) {
    const s = Math.round(seconds);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}
//# sourceMappingURL=history.js.map