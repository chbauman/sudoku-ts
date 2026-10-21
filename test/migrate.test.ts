import {
  shiftGame,
  shiftHistory,
  shiftPuzzleId,
  shiftSettings,
} from "../src/migrate";

test("puzzle IDs get the new level", () => {
  expect(shiftPuzzleId("0-17")).toBe("1-17");
  expect(shiftPuzzleId("4-203")).toBe("5-203");
  expect(shiftPuzzleId(null)).toBeNull();
  expect(shiftPuzzleId("custom")).toBe("custom");
});

test("settings: the default level moves up", () => {
  const s = JSON.parse(shiftSettings(JSON.stringify({ level: 2, theme: "dark" })));
  expect(s).toEqual({ level: 3, theme: "dark" });
});

test("history: levels and IDs move up, the rest is kept", () => {
  const e = { id: "1-5", level: 1, seconds: 60, date: "d", puzzle: "0 1" };
  const out = JSON.parse(shiftHistory(JSON.stringify([e, { ...e, id: "0-9", level: 0 }])));
  expect(out).toEqual([
    { ...e, id: "2-5", level: 2 },
    { ...e, id: "1-9", level: 1 },
  ]);
  expect(shiftHistory("{}")).toBe("{}"); // not a list: unchanged
});

test("saved game: the level moves up, custom sudokus stay", () => {
  const g = JSON.parse(shiftGame(JSON.stringify({ sudLvl: 2, puzzleId: "2-7", T: [] })));
  expect(g).toEqual({ sudLvl: 3, puzzleId: "3-7", T: [] });
  const c = JSON.parse(shiftGame(JSON.stringify({ sudLvl: -1, puzzleId: null })));
  expect(c).toEqual({ sudLvl: -1, puzzleId: null });
});
