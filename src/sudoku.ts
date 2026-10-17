const DEBUG = false;

// Highest level of the sudokus (levels are 0 to MAX_LEVEL, the files
// assets/data/ext_lvl_<level>.txt, see scripts/make-levels.mjs)
const MAX_LEVEL = 5;

// Arrays to store the current sudoku
// T stores the currently set numbers
const T: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));
// Tsol stores the solution if available
const Tsol: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));
// Tinit stores the initial sudoku
const Tinit: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));

// 0: Normal
// 1: Wrong (checked)
// 2: Current Hypothesis
// 3: Current Hypothesis Wrong (checked)
const Marked: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));

// 2D and 3D array deep copy functions
function deepCopy2D(arr: any[][]): any[][] {
  const arrLen = arr.length;
  let newArr = new Array(arrLen);
  for (let i = 0; i < arrLen; i++) {
    newArr[i] = arr[i].slice();
  }
  return newArr;
}
function deepCopy3D(arr: any[][][]): any[][][] {
  const arrLen = arr.length;
  let newArr = new Array(arrLen);
  for (let i = 0; i < arrLen; i++) {
    newArr[i] = deepCopy2D(arr[i]);
  }
  return newArr;
}

/** Create an array with numbers from 0 to n-1 */
function range(n: number): number[] {
  let arr = new Array(n);
  for (let i = 0; i < n; ++i) {
    arr[i] = i;
  }
  return arr;
}
function copyTo2d(srcArr: any[][], destArr: any[][]) {
  const len = srcArr.length;
  for (let i = 0; i < len; i++) {
    destArr[i] = srcArr[i].slice();
  }
}

// Shuffle array
function shuffle(array: any[]): any[] {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Maybe not sufficient, checks if all digits are set
function checkSolved(sud: number[][]) {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (sud[i][j] == 0) {
        return false;
      }
    }
  }
  return true;
}

// Reads a random sudoku from the file and loads it.
function readSudokuFromFile(
  callback: (s: string, index: number) => void,
  lvl = MAX_LEVEL
) {
  console.log("Loading file");
  const fileName = "../assets/data/ext_lvl_" + lvl.toString() + ".txt";
  fetch(fileName)
    .then((response) => response.text())
    .then((data) => {
      const items = data.split("\n");
      const nItems = items.length - 1;
      const sInd = Math.floor(Math.random() * nItems);
      callback(items[sInd], sInd);
    });
}

// The grid as a string of its 81 digits, row by row (0 = empty)
function gridToString(g: number[][]): string {
  return g.map((r) => r.join("")).join("");
}

// Parses a line of a level file: "<description>;<puzzle>;<solution>" where
// puzzle and solution are the 81 space separated cell values (0 = empty),
// row by row (the format of the generator in sudoku-cpp).
function parseSudokuLine(line: string): { sud: number[][]; sol: number[][] } {
  const parts = line.trim().split(";");
  if (parts.length !== 3) throw new Error("Invalid sudoku line: " + line);
  const toGrid = (str: string) => {
    const vals = str.trim().split(/\s+/).map(Number);
    if (vals.length !== 81 || vals.some((v) => !(v >= 0 && v <= 9))) {
      throw new Error("Invalid sudoku line: " + line);
    }
    return range(9).map((i) => vals.slice(9 * i, 9 * i + 9));
  };
  return { sud: toGrid(parts[1]), sol: toGrid(parts[2]) };
}

// Finds all numbers that can be set in cell (x, y)
function allowed(A: number[][], y: number, x: number, ignoreSet = false) {
  const res: number[] = [];
  const arr: boolean[] = new Array(10).fill(true);
  if (A[y][x] > 0 && !ignoreSet) return res;
  for (let i = 0; i < 9; i++) arr[A[y][i]] = false;
  for (let i = 0; i < 9; i++) arr[A[i][x]] = false;
  for (let i = 0; i < 9; i++)
    arr[A[y - (y % 3) + Math.floor(i / 3)][x - (x % 3) + (i % 3)]] = false;
  for (let i = 1; i < 10; i++) if (arr[i]) res.push(i);
  return res;
}

// Permute sudoku
function permuteSuds(s: number[][], sudokuSol: number[][], n = 5) {
  const numPer = range(9);
  shuffle(numPer);
  for (let i = 0; i < 9; ++i) {
    for (let k = 0; k < 9; ++k) {
      const val = sudokuSol[i][k];
      const valNew = numPer[val - 1] + 1;
      sudokuSol[i][k] = valNew;
      if (s[i][k] != 0) {
        s[i][k] = valNew;
      }
    }
  }

  // Make copy
  let solutionCopy: any[][];
  let sudokuCopy: any[][];

  // New Permutation
  const per3 = range(3);

  for (let nShuff = 0; nShuff < n; ++nShuff) {
    // Copy again
    solutionCopy = deepCopy2D(sudokuSol);
    sudokuCopy = deepCopy2D(s);

    // Permute rows
    for (let k = 0; k < 3; ++k) {
      shuffle(per3);
      let offs = k * 3;
      for (let i = 0; i < 3; ++i) {
        sudokuSol[offs + i] = solutionCopy[offs + per3[i]].slice();
        s[offs + i] = sudokuCopy[offs + per3[i]].slice();
      }
    }
    // Copy again
    solutionCopy = deepCopy2D(sudokuSol);
    sudokuCopy = deepCopy2D(s);

    // Permute cols
    for (let k = 0; k < 3; ++k) {
      shuffle(per3);
      let offs = k * 3;
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 9; ++j) {
          sudokuSol[j][offs + i] = solutionCopy[j][offs + per3[i]];
          s[j][offs + i] = sudokuCopy[j][offs + per3[i]];
        }
      }
    }

    // Copy again
    solutionCopy = deepCopy2D(sudokuSol);
    sudokuCopy = deepCopy2D(s);

    // Permute rows of squares
    shuffle(per3);
    for (let k = 0; k < 3; ++k) {
      const offs = per3[k] * 3;
      const offsK = k * 3;
      for (let i = 0; i < 3; ++i) {
        sudokuSol[offsK + i] = solutionCopy[offs + i].slice();
        s[offsK + i] = sudokuCopy[offs + i].slice();
      }
    }

    // Copy again
    solutionCopy = deepCopy2D(sudokuSol);
    sudokuCopy = deepCopy2D(s);

    // Permute cols of squares
    shuffle(per3);
    for (let k = 0; k < 3; ++k) {
      const offs = per3[k] * 3;
      const offsK = k * 3;
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 9; ++j) {
          sudokuSol[j][offsK + i] = solutionCopy[j][offs + i];
          s[j][offsK + i] = sudokuCopy[j][offs + i];
        }
      }
    }
  }
}

// Export
export {
  MAX_LEVEL,
  T,
  Tsol,
  Tinit,
  DEBUG,
  Marked,
  range,
  shuffle,
  deepCopy2D,
  readSudokuFromFile,
  parseSudokuLine,
  gridToString,
  permuteSuds,
  copyTo2d,
  allowed,
  checkSolved,
  deepCopy3D,
};
