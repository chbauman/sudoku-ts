// Builds the level files assets/data/ext_lvl_<level>.txt from collections of
// the generator of sudoku-cpp (lines "<desc>;<puzzle>;<solution>").
//
//   node scripts/make-levels.mjs collection.txt [more.txt ...]
//
// Puzzles that occur several times are only kept once. All puzzles with a
// level above TOP_LEVEL are put into the top level (so a puzzle of level 7
// would be in ext_lvl_6.txt). The file number is the level of sudoku-cpp plus
// one (its easiest level -1 is level 0 here). Keep TOP_LEVEL in sync with
// LEVEL_NAMES (MAX_LEVEL) in src/sudoku.ts and the number of level files in
// src/sw.js.
import { readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";

const TOP_LEVEL = 6;
// Level of the generator that is level 0 here
const LOWEST_GENERATOR_LEVEL = -1;
const dir = "assets/data";

const files = process.argv.slice(2);
if (files.length === 0) {
  console.error("Usage: node scripts/make-levels.mjs collection.txt [more.txt ...]");
  process.exit(2);
}

const seen = new Set();
const levels = Array.from({ length: TOP_LEVEL + 1 }, () => []);
for (const file of files) {
  for (const line of readFileSync(file, "utf8").split("\n")) {
    if (!line.trim()) continue;
    const [desc, puzzle, solution] = line.split(";");
    if (solution === undefined || seen.has(puzzle)) continue;
    seen.add(puzzle);
    const [level, ...rest] = desc.split(",");
    const binned = Math.min(Number(level) - LOWEST_GENERATOR_LEVEL, TOP_LEVEL);
    if (!(binned >= 0)) continue;
    levels[binned].push([String(binned), ...rest].join(",") + ";" + puzzle + ";" + solution);
  }
}

for (const f of readdirSync(dir)) {
  if (/^ext_lvl_\d+\.txt$/.test(f)) rmSync(`${dir}/${f}`);
}
levels.forEach((lines, level) => {
  writeFileSync(`${dir}/ext_lvl_${level}.txt`, lines.join("\n") + "\n");
  console.log(`Level ${level}: ${lines.length} sudokus`);
});
