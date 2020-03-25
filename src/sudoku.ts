const DEBUG = false;

// Arrays to store the current sudoku
// T stores the currently set numbers
var T: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));
// Tsol stores the solution if available
var Tsol: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));
// Tinit stores the initial sudoku
var Tinit: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));

// 0: Normal
// 1: Wrong (checked)
// 2: Current Hypothesis
// 3: Current Hypothesis Wrong (checked)
var Marked: number[][] = Array.from(new Array(9), () => new Array(9).fill(0));

// Hypotheses

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
function range(n: number): number[] {
  let arr = new Array(n);
  for (let i = 0; i < n; ++i) {
    arr[i] = i;
  }
  return arr;
}
function copy_to_2d(src_arr: any[][], dest_arr: any[][]) {
  const len = src_arr.length;
  for (let i = 0; i < len; i++) {
    dest_arr[i] = src_arr[i].slice();
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
function read_sudoku_from_file(callback: (s: string) => void, lvl = 7) {
  console.log("Loading file");
  const f_name = "./data/ext_lvl_" + lvl.toString() + ".txt";
  fetch(f_name)
    .then(response => response.text())
    .then(data => {
      const items = data.split("\n");
      const n_s = items.length - 1;
      let s_ind = Math.floor(Math.random() * n_s);
      let sud_str = items[s_ind];
      callback(sud_str);
    });
}

// Finds all numbers that can be set in cell (x, y)
function allowed(A: number[][], y: number, x: number, ignore_set = false) {
  let res: number[] = [];
  let arr = new Array(10).fill(true);
  if (A[y][x] > 0 && !ignore_set) return res;
  for (let i = 0; i < 9; i++) arr[A[y][i]] = false;
  for (let i = 0; i < 9; i++) arr[A[i][x]] = false;
  for (let i = 0; i < 9; i++)
    arr[A[y - (y % 3) + Math.floor(i / 3)][x - (x % 3) + (i % 3)]] = false;
  for (let i = 1; i < 10; i++) if (arr[i]) res.push(i);
  return res;
}

// Permute sudoku
function permuteSuds(s: number[][], s_sol: number[][], n = 5) {
  let num_per = range(9);
  shuffle(num_per);
  for (let i = 0; i < 9; ++i) {
    for (let k = 0; k < 9; ++k) {
      let val = s_sol[i][k];
      let val_new = num_per[val - 1] + 1;
      s_sol[i][k] = val_new;
      if (s[i][k] != 0) {
        s[i][k] = val_new;
      }
    }
  }

  // Make copy
  let sol_copy: any[][];
  let s_copy: any[][];

  // New Permutation
  let per3 = range(3);

  for (let n_shuff = 0; n_shuff < n; ++n_shuff) {
    // Copy again
    sol_copy = deepCopy2D(s_sol);
    s_copy = deepCopy2D(s);

    // Permute rows
    for (let k = 0; k < 3; ++k) {
      shuffle(per3);
      let offs = k * 3;
      for (let i = 0; i < 3; ++i) {
        s_sol[offs + i] = sol_copy[offs + per3[i]].slice();
        s[offs + i] = s_copy[offs + per3[i]].slice();
      }
    }
    // Copy again
    sol_copy = deepCopy2D(s_sol);
    s_copy = deepCopy2D(s);

    // Permute cols
    for (let k = 0; k < 3; ++k) {
      shuffle(per3);
      let offs = k * 3;
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 9; ++j) {
          s_sol[j][offs + i] = sol_copy[j][offs + per3[i]];
          s[j][offs + i] = s_copy[j][offs + per3[i]];
        }
      }
    }

    // Copy again
    sol_copy = deepCopy2D(s_sol);
    s_copy = deepCopy2D(s);

    // Permute rows of squares
    shuffle(per3);
    for (let k = 0; k < 3; ++k) {
      let offs = per3[k] * 3;
      let offs_k = k * 3;
      for (let i = 0; i < 3; ++i) {
        s_sol[offs_k + i] = sol_copy[offs + i].slice();
        s[offs_k + i] = s_copy[offs + i].slice();
      }
    }

    // Copy again
    sol_copy = deepCopy2D(s_sol);
    s_copy = deepCopy2D(s);

    // Permute cols of squares
    shuffle(per3);
    for (let k = 0; k < 3; ++k) {
      let offs = per3[k] * 3;
      let offs_k = k * 3;
      for (let i = 0; i < 3; ++i) {
        for (let j = 0; j < 9; ++j) {
          s_sol[j][offs_k + i] = sol_copy[j][offs + i];
          s[j][offs_k + i] = s_copy[j][offs + i];
        }
      }
    }
  }
}

// Export
export {
  T,
  Tsol,
  Tinit,
  DEBUG,
  Marked,
  range,
  shuffle,
  deepCopy2D,
  read_sudoku_from_file,
  permuteSuds,
  copy_to_2d,
  allowed,
  checkSolved,
  deepCopy3D
};
