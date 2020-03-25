var DEBUG = true;
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
function copy_to_2d(src_arr, dest_arr) {
    var len = src_arr.length;
    for (var i = 0; i < len; i++) {
        dest_arr[i] = src_arr[i].slice();
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
function read_sudoku_from_file(callback, lvl) {
    if (lvl === void 0) { lvl = 7; }
    console.log("Loading file");
    var f_name = "../data/ext_lvl_" + lvl.toString() + ".txt";
    fetch(f_name)
        .then(function (response) { return response.text(); })
        .then(function (data) {
        var items = data.split("\n");
        var n_s = items.length - 1;
        var s_ind = Math.floor(Math.random() * n_s);
        var sud_str = items[s_ind];
        callback(sud_str);
    });
}
function allowed(A, y, x) {
    var res = [];
    var arr = new Array(10).fill(true);
    if (A[y][x] > 0)
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
function permuteSuds(s, s_sol, n) {
    if (n === void 0) { n = 5; }
    var num_per = range(9);
    shuffle(num_per);
    for (var i = 0; i < 9; ++i) {
        for (var k = 0; k < 9; ++k) {
            var val = s_sol[i][k];
            var val_new = num_per[val - 1] + 1;
            s_sol[i][k] = val_new;
            if (s[i][k] != 0) {
                s[i][k] = val_new;
            }
        }
    }
    var sol_copy;
    var s_copy;
    var per3 = range(3);
    for (var n_shuff = 0; n_shuff < n; ++n_shuff) {
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);
        for (var k = 0; k < 3; ++k) {
            shuffle(per3);
            var offs = k * 3;
            for (var i = 0; i < 3; ++i) {
                s_sol[offs + i] = sol_copy[offs + per3[i]].slice();
                s[offs + i] = s_copy[offs + per3[i]].slice();
            }
        }
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);
        for (var k = 0; k < 3; ++k) {
            shuffle(per3);
            var offs = k * 3;
            for (var i = 0; i < 3; ++i) {
                for (var j = 0; j < 9; ++j) {
                    s_sol[j][offs + i] = sol_copy[j][offs + per3[i]];
                    s[j][offs + i] = s_copy[j][offs + per3[i]];
                }
            }
        }
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);
        shuffle(per3);
        for (var k = 0; k < 3; ++k) {
            var offs = per3[k] * 3;
            var offs_k = k * 3;
            for (var i = 0; i < 3; ++i) {
                s_sol[offs_k + i] = sol_copy[offs + i].slice();
                s[offs_k + i] = s_copy[offs + i].slice();
            }
        }
        sol_copy = deepCopy2D(s_sol);
        s_copy = deepCopy2D(s);
        shuffle(per3);
        for (var k = 0; k < 3; ++k) {
            var offs = per3[k] * 3;
            var offs_k = k * 3;
            for (var i = 0; i < 3; ++i) {
                for (var j = 0; j < 9; ++j) {
                    s_sol[j][offs_k + i] = sol_copy[j][offs + i];
                    s[j][offs_k + i] = s_copy[j][offs + i];
                }
            }
        }
    }
}
export { T, Tsol, Tinit, DEBUG, Marked, range, shuffle, deepCopy2D, read_sudoku_from_file, permuteSuds, copy_to_2d, allowed, checkSolved, deepCopy3D };
//# sourceMappingURL=sudoku.js.map