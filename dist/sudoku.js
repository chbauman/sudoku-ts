var DEBUG = false;
var T = Array.from(new Array(9), function () { return new Array(9).fill(0); });
var Tsol = Array.from(new Array(9), function () { return new Array(9).fill(0); });
var Tinit = Array.from(new Array(9), function () { return new Array(9).fill(0); });
var Marked = Array.from(new Array(9), function () { return new Array(9).fill(0); });
function deepCopy2D(arr) {
    var arrLen = arr.length;
    var newArr = new Array(arrLen);
    for (var i = 0; i < arrLen; i++) {
        newArr[i] = arr[i].slice();
    }
    return newArr;
}
function deepCopy3D(arr) {
    var arrLen = arr.length;
    var newArr = new Array(arrLen);
    for (var i = 0; i < arrLen; i++) {
        newArr[i] = deepCopy2D(arr[i]);
    }
    return newArr;
}
function range(n) {
    var arr = new Array(n);
    for (var i = 0; i < n; ++i) {
        arr[i] = i;
    }
    return arr;
}
function copyTo2d(srcArr, destArr) {
    var len = srcArr.length;
    for (var i = 0; i < len; i++) {
        destArr[i] = srcArr[i].slice();
    }
}
function shuffle(array) {
    var _a;
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        _a = [array[j], array[i]], array[i] = _a[0], array[j] = _a[1];
    }
    return array;
}
function checkSolved(sud) {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (sud[i][j] == 0) {
                return false;
            }
        }
    }
    return true;
}
function readSudokuFromFile(callback, lvl) {
    if (lvl === void 0) { lvl = 7; }
    console.log("Loading file");
    var fileName = "./data/ext_lvl_" + lvl.toString() + ".txt";
    fetch(fileName)
        .then(function (response) { return response.text(); })
        .then(function (data) {
        var items = data.split("\n");
        var nItems = items.length - 1;
        var sInd = Math.floor(Math.random() * nItems);
        callback(items[sInd]);
    });
}
function allowed(A, y, x, ignoreSet) {
    if (ignoreSet === void 0) { ignoreSet = false; }
    var res = [];
    var arr = new Array(10).fill(true);
    if (A[y][x] > 0 && !ignoreSet)
        return res;
    for (var i = 0; i < 9; i++)
        arr[A[y][i]] = false;
    for (var i = 0; i < 9; i++)
        arr[A[i][x]] = false;
    for (var i = 0; i < 9; i++)
        arr[A[y - (y % 3) + Math.floor(i / 3)][x - (x % 3) + (i % 3)]] = false;
    for (var i = 1; i < 10; i++)
        if (arr[i])
            res.push(i);
    return res;
}
function permuteSuds(s, sudokuSol, n) {
    if (n === void 0) { n = 5; }
    var numPer = range(9);
    shuffle(numPer);
    for (var i = 0; i < 9; ++i) {
        for (var k = 0; k < 9; ++k) {
            var val = sudokuSol[i][k];
            var valNew = numPer[val - 1] + 1;
            sudokuSol[i][k] = valNew;
            if (s[i][k] != 0) {
                s[i][k] = valNew;
            }
        }
    }
    var solutionCopy;
    var sudokuCopy;
    var per3 = range(3);
    for (var nShuff = 0; nShuff < n; ++nShuff) {
        solutionCopy = deepCopy2D(sudokuSol);
        sudokuCopy = deepCopy2D(s);
        for (var k = 0; k < 3; ++k) {
            shuffle(per3);
            var offs = k * 3;
            for (var i = 0; i < 3; ++i) {
                sudokuSol[offs + i] = solutionCopy[offs + per3[i]].slice();
                s[offs + i] = sudokuCopy[offs + per3[i]].slice();
            }
        }
        solutionCopy = deepCopy2D(sudokuSol);
        sudokuCopy = deepCopy2D(s);
        for (var k = 0; k < 3; ++k) {
            shuffle(per3);
            var offs = k * 3;
            for (var i = 0; i < 3; ++i) {
                for (var j = 0; j < 9; ++j) {
                    sudokuSol[j][offs + i] = solutionCopy[j][offs + per3[i]];
                    s[j][offs + i] = sudokuCopy[j][offs + per3[i]];
                }
            }
        }
        solutionCopy = deepCopy2D(sudokuSol);
        sudokuCopy = deepCopy2D(s);
        shuffle(per3);
        for (var k = 0; k < 3; ++k) {
            var offs = per3[k] * 3;
            var offsK = k * 3;
            for (var i = 0; i < 3; ++i) {
                sudokuSol[offsK + i] = solutionCopy[offs + i].slice();
                s[offsK + i] = sudokuCopy[offs + i].slice();
            }
        }
        solutionCopy = deepCopy2D(sudokuSol);
        sudokuCopy = deepCopy2D(s);
        shuffle(per3);
        for (var k = 0; k < 3; ++k) {
            var offs = per3[k] * 3;
            var offsK = k * 3;
            for (var i = 0; i < 3; ++i) {
                for (var j = 0; j < 9; ++j) {
                    sudokuSol[j][offsK + i] = solutionCopy[j][offs + i];
                    s[j][offsK + i] = sudokuCopy[j][offs + i];
                }
            }
        }
    }
}
export { T, Tsol, Tinit, DEBUG, Marked, range, shuffle, deepCopy2D, readSudokuFromFile, permuteSuds, copyTo2d, allowed, checkSolved, deepCopy3D, };
//# sourceMappingURL=sudoku.js.map