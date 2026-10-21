// One-time migration of the stored levels. The level "Easy" was added below
// "Medium", so every level number is one higher than before (Medium was 0 and
// is 1 now). The settings, the history and the saved game store levels, they
// are shifted once; a marker key remembers that this was done.
import { storageGet, storageRemove, storageSet } from "./storage.js";

const MARKER_KEY = "sudoku-ts:levels:v2";
const SETTINGS_KEY = "sudoku-ts:settings:v1";
const HISTORY_KEY = "sudoku-ts:history:v1";
const GAME_KEY = "sudoku-ts:game:v1";

/** "<level>-<line>" -> "<level + 1>-<line>" (anything else is kept) */
export function shiftPuzzleId(id: unknown): unknown {
  if (typeof id !== "string") return id;
  const m = /^(\d+)-(.*)$/.exec(id);
  return m ? `${Number(m[1]) + 1}-${m[2]}` : id;
}

/** Shifts the level of the stored settings (JSON), returns the new JSON */
export function shiftSettings(raw: string): string {
  const s = JSON.parse(raw);
  if (Number.isInteger(s.level) && s.level >= 0) s.level += 1;
  return JSON.stringify(s);
}

/** Shifts the levels and IDs of the stored history (JSON) */
export function shiftHistory(raw: string): string {
  const entries = JSON.parse(raw);
  if (!Array.isArray(entries)) return raw;
  for (const e of entries) {
    if (Number.isInteger(e?.level) && e.level >= 0) {
      e.level += 1;
      e.id = shiftPuzzleId(e.id);
    }
  }
  return JSON.stringify(entries);
}

/** Shifts the level of the saved game (JSON); custom sudokus (negative) stay */
export function shiftGame(raw: string): string {
  const g = JSON.parse(raw);
  if (Number.isInteger(g.sudLvl) && g.sudLvl >= 0) {
    g.sudLvl += 1;
    g.puzzleId = shiftPuzzleId(g.puzzleId);
  }
  return JSON.stringify(g);
}

async function migrate() {
  if (await storageGet(MARKER_KEY)) return;
  for (const [key, shift] of [
    [SETTINGS_KEY, shiftSettings],
    [HISTORY_KEY, shiftHistory],
    [GAME_KEY, shiftGame],
  ] as const) {
    try {
      const raw = await storageGet(key);
      if (raw) storageSet(key, shift(raw));
    } catch (e) {
      // invalid data is dropped by the loaders anyway
    }
  }
  storageSet(MARKER_KEY, "1");
}

let migrating: Promise<void> | null = null;

/** Migrates the stored levels once; call (and await) before reading them */
export function migrateLevels(): Promise<void> {
  return (migrating ??= migrate().catch(() => {}));
}
