// This also runs the module
import {
  T,
  range,
  shuffle,
  deepCopy2D,
  permuteSuds,
  copyTo2d,
  allowed,
  checkSolved,
  deepCopy3D,
} from "../src/sudoku.js";

// Checks if sudoku contains valid values
function check_sudoku(s) {
  const n1 = s.length;
  const n2 = s[0].length;
  for (let i = 0; i < n1; ++i) {
    for (let k = 0; k < n2; ++k) {
      let el = s[i][k];
      if (el < 0 || el > 9) {
        return false;
      }
    }
  }
  return true;
}

function generate_sample_sud() {
  let sud = Array.from(new Array(9), () => new Array(9).fill(0));
  sud[0] = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  sud[1] = [4, 5, 6, 7, 8, 9, 1, 2, 3];
  return sud;
}

test("test T", () => {
  expect(T.length).toBe(9);
  expect(check_sudoku(T)).toBe(true);
});

test("test 3d deep copy", () => {
  let arr1 = [
    [
      [1, 2],
      [4, 5],
    ],
    [
      [3, 3],
      [6, 6],
    ],
  ];
  let arr2 = deepCopy3D(arr1);
  arr1[0][0][0] = 5;
  expect(arr2[0][0][0]).toBe(1);
});

test("test 2d deep copy", () => {
  let arr1 = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  let arr2 = deepCopy2D(arr1);
  arr1[0][0] = 5;
  expect(arr2[0][0]).toBe(1);
});

test("test 2d deep copy 2", () => {
  let arr1 = [
    [1, 2, 3],
    [4, 5, 6],
  ];
  let arr2 = [
    [0, 0, 0],
    [0, 0, 0],
  ];
  copyTo2d(arr1, arr2);
  arr1[0][0] = 5;
  expect(arr2[0][0]).toBe(1);
});

test("test shuffle", () => {
  let arr1 = [1, 2, 3, 4, 5];
  let arr2 = shuffle(arr1);
  const arrSum = (arr2) => arr2.reduce((a, b) => a + b, 0);
  expect(arr2.length).toBe(5);
  expect(arrSum(arr2)).toBe(15);
});

test("test range", () => {
  let arr1 = [0, 1, 2, 3, 4];
  let arr2 = range(5);
  for (let i = 0; i < 5; ++i) {
    expect(arr1[i]).toBe(arr2[i]);
  }
});

test("test permute", () => {
  let sud = generate_sample_sud();
  let sud2 = generate_sample_sud();
  permuteSuds(sud, sud2);
});

test("test check solved", () => {
  let sud = generate_sample_sud();
  expect(checkSolved(sud)).toBe(false);
  let sud2 = Array.from(new Array(9), () => new Array(9).fill(1));
  expect(checkSolved(sud2)).toBe(true);
});

test("test allowed", () => {
  let sud = generate_sample_sud();
  let all_nums = allowed(sud, 2, 0);
  expect(all_nums.length).toBe(3);
});
