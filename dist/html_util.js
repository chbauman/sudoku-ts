import { T, DEBUG, Marked, readSudokuFromFile, Tsol, Tinit, permuteSuds, copyTo2d, allowed, checkSolved, deepCopy2D, deepCopy3D, } from "./sudoku.js";
var col1 = "var(--accent)";
var smallDigCol = "var(--small-dig-bg)";
var rowColSquareForbidCol = "var(--forbid-bg)";
var sameDigCol = "var(--same-bg)";
var hypCol = "var(--hyp)";
var normH = "var(--selected-bg)";
var wrongHypCol = "var(--wrong)";
var large = true;
var smallDigsEnabled = true;
var curX = -1;
var curY = 0;
var solAvailable = false;
var inputtingOwnSud = false;
var sudLvl;
var choosingHyp = false;
var hypRejectionEnabled = false;
var hyps = [];
var Tref = Array.from(new Array(9), function () { return new Array(9); });
var digits = new Array(10);
var TsubHTMLTables = Array.from(new Array(9), function () { return new Array(9); });
var TsubBinaryTables = Array.from(new Array(9), function () { return new Array(9); });
var TminiCells = Array.from(new Array(9), function () { return new Array(9); });
var htmlButtonDict = new Map();
var getAssertedButton = function (name) {
    var res = htmlButtonDict.get(name);
    if (res === undefined) {
        throw new Error("Undefined button!");
    }
    return res;
};
function log(msg) {
    if (DEBUG) {
        console.log(msg);
    }
}
function setActive(id, on) {
    getAssertedButton(id).classList.toggle("active", on);
}
function setEnabled(id, on) {
    getAssertedButton(id).classList.toggle("disabled", !on);
}
function toggleLargeSmall() {
    large = !large;
    setActive("mode-but", !large);
}
function enlarge(e) {
    if (e === void 0) { e = undefined; }
    if (!large) {
        toggleLargeSmall();
        log("enlarged");
    }
    if (e)
        e.stopPropagation();
}
function shrink(e) {
    if (e === void 0) { e = undefined; }
    if (large) {
        toggleLargeSmall();
        log("shrunken");
    }
    if (e)
        e.stopPropagation();
}
function initGrid(tbl) {
    for (var i = 0; i < 9; i++) {
        var row = tbl.insertRow(-1);
        row.className = "gridRow";
        for (var j = 0; j < 9; j++) {
            Tref[i][j] = row.insertCell(-1);
            Tref[i][j].className = "gridCell";
            if (i % 3 == 0)
                Tref[i][j].className += " topBorder";
            if (i % 3 == 2)
                Tref[i][j].className += " bottomBorder";
            if (j % 3 == 0)
                Tref[i][j].className += " leftBorder";
            if (j % 3 == 2)
                Tref[i][j].className += " rightBorder";
            var y = document.createAttribute("y");
            var x = document.createAttribute("x");
            var click = document.createAttribute("clickable");
            var subTab = document.createElement("table");
            click.value = "0";
            y.value = i.toString();
            x.value = j.toString();
            Tref[i][j].setAttributeNode(y);
            Tref[i][j].setAttributeNode(x);
            Tref[i][j].setAttributeNode(click);
            TminiCells[i][j] = new Array(9);
            subTab.className = "innerTable";
            var subRow = null;
            var subCell = void 0;
            for (var k = 0; k < 9; k++) {
                if (k % 3 == 0) {
                    subRow = subTab.insertRow(-1);
                    subRow.className = "gridRow";
                }
                subCell = subRow.insertCell(-1);
                subCell.innerHTML = "";
                subCell.className = "subGridCell";
                TminiCells[i][j][k] = subCell;
            }
            Tref[i][j].appendChild(subTab);
            TsubHTMLTables[i][j] = subTab;
            TsubBinaryTables[i][j] = new Array(9).fill(false);
        }
    }
    setTimeout(function () {
        loadRandomSud(4);
    }, 250);
}
function setLevelFun() {
    var ulEl = getAssertedButton("lvl_list");
    var kids = ulEl.childNodes;
    var ct = 0;
    var _loop_1 = function (k) {
        var innHtml = kids[k].innerHTML;
        if (innHtml) {
            var n_1 = parseInt(innHtml.split(" ")[1]);
            kids[k].addEventListener("click", function () { return loadRandomSud(n_1); });
            ++ct;
        }
    };
    for (var k = 0; k < kids.length; ++k) {
        _loop_1(k);
    }
}
function startHyp(e) {
    hypothesis1();
    e.stopPropagation();
}
var pendingConfirm = null;
function confirmAction(title, description, action) {
    pendingConfirm = action;
    getAssertedButton("confirm-title").textContent = title;
    getAssertedButton("confirm-desc").textContent = description;
    $("#confirm").popup("open");
}
function setButtons() {
    getAssertedButton("mode-but").addEventListener("click", function () {
        if (smallDigsEnabled)
            large ? shrink() : enlarge();
    });
    enableSmallDigs();
    function restAndClose(e) {
        restart();
        $("#restart").popup("close");
        e.stopPropagation();
    }
    getAssertedButton("restart_but").addEventListener("click", restAndClose);
    getAssertedButton("confirm-yes").addEventListener("click", function (e) {
        var action = pendingConfirm;
        pendingConfirm = null;
        $("#confirm").popup("close");
        if (action)
            action();
        e.stopPropagation();
    });
    getAssertedButton("confirm-cancel").addEventListener("click", function (e) {
        pendingConfirm = null;
        $("#confirm").popup("close");
        e.stopPropagation();
    });
    getAssertedButton("auto-fill-button").addEventListener("click", function () {
        return confirmAction("Fill in pencil marks?", "Adds all digits that are still possible as pencil marks to every empty cell.", fillSmallDigits);
    });
    getAssertedButton("own_sud").addEventListener("click", function () {
        if (inputtingOwnSud) {
            inputCustomSudoku();
        }
        else {
            confirmAction("Empty grid?", "Add your own sudoku. Current game will be lost.", inputCustomSudoku);
        }
    });
    enableHyp();
    disableHypRejection();
    getAssertedButton("but3").addEventListener("click", endHyp);
    getAssertedButton("digits").style.display = "none";
    getAssertedButton("digits").style.display = "inline-block";
    getAssertedButton("buttons1").style.display = "none";
    setLevelFun();
    function solveAndClose() {
        solve();
        $("#help").popup("close");
    }
    getAssertedButton("solve").addEventListener("click", solveAndClose);
    function checkAndClose() {
        check();
        $("#help").popup("close");
    }
    getAssertedButton("check").addEventListener("click", checkAndClose);
}
function disableHyp() {
    getAssertedButton("but1").onclick = null;
    setEnabled("but1", false);
}
function enableHyp() {
    getAssertedButton("but1").onclick = startHyp;
    setEnabled("but1", true);
}
function resetMiniCell(y, x, n) {
    TminiCells[y][x][n - 1].innerHTML = "";
    TsubBinaryTables[y][x][n - 1] = false;
}
function setMiniCell(y, x, n) {
    TminiCells[y][x][n - 1].innerHTML = n.toString();
    TsubBinaryTables[y][x][n - 1] = true;
}
function toggleMiniCell(y, x, n) {
    var alreadySet = TsubBinaryTables[y][x][n - 1];
    if (alreadySet) {
        TminiCells[y][x][n - 1].innerHTML = "";
    }
    else {
        TminiCells[y][x][n - 1].innerHTML = n.toString();
    }
    TsubBinaryTables[y][x][n - 1] = !alreadySet;
}
function eliminateSmallDigs(y, x, n) {
    var xFloor = x - (x % 3);
    var yFloor = y - (y % 3);
    for (var i = 0; i < 9; i++) {
        resetMiniCell(y, i, n);
        resetMiniCell(i, x, n);
        resetMiniCell(yFloor + (i % 3), xFloor + Math.floor(i / 3), n);
    }
}
function setCell(y, x, n, largeMode, highlightCells, removeRed) {
    if (largeMode === void 0) { largeMode = true; }
    if (highlightCells === void 0) { highlightCells = false; }
    if (removeRed === void 0) { removeRed = false; }
    if (n == 0) {
        Tref[y][x].innerHTML = "";
        Tref[y][x].appendChild(TsubHTMLTables[y][x]);
        for (var i = 0; i < 9; i++) {
            resetMiniCell(y, x, i + 1);
        }
        Marked[y][x] = 0;
    }
    else {
        if (largeMode) {
            Tref[y][x].innerHTML = n.toString();
            eliminateSmallDigs(y, x, n);
            if (highlightCells)
                highlight(y, x);
            if (removeRed) {
                Marked[y][x] = 0;
                Tref[y][x].style.backgroundColor = normH;
            }
        }
        else {
            toggleMiniCell(y, x, n);
        }
    }
}
function hypothesis1() {
    if (!choosingHyp) {
        log("Choosing ".concat(hyps.length + 1, "-th hypothesis."));
        disableSmallDigs();
        setActive("but1", true);
        choosingHyp = true;
        log("Started choosing, curX = ".concat(curX));
        if (curX >= 0) {
            clickCell(Tref[curY][curX]);
        }
    }
    else {
        finishedHypChoosing();
    }
}
function endHyp(e) {
    if (hypRejectionEnabled) {
        hypothesis3();
    }
    e.stopPropagation();
}
function hypothesis3() {
    var nHyps = hyps.length;
    if (nHyps < 1)
        return;
    var lastHyp = hyps[nHyps - 1];
    log("N hyps: ".concat(nHyps));
    var markCopy = deepCopy2D(Marked);
    if (nHyps < 2) {
        copyTo2d(Tinit, T);
        updateGrid();
        setClickableTrefT();
    }
    else {
        copyTo2d(hyps[nHyps - 2][1], T);
        updateGrid();
        setClickableTrefT();
        var y = hyps[nHyps - 2][0][0];
        var x = hyps[nHyps - 2][0][1];
        Tref[y][x].style.color = hypCol;
        Tref[y][x].setAttribute("clickable", "0");
    }
    copyTo2d(lastHyp[1], T);
    TsubBinaryTables = lastHyp[2];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] > 0) {
                var m = markCopy[i][j];
                setCell(i, j, T[i][j], true, false);
                if (Tref[i][j].getAttribute("clickable") == "1") {
                    Tref[i][j].style.color = col1;
                    if (m > 0) {
                        Tref[i][j].style.backgroundColor = wrongHypCol;
                        Marked[i][j] = 1;
                        log("m is ".concat(m, ", setting (").concat(i, ", ").concat(j, ")"));
                    }
                }
            }
            else {
                for (var k = 0; k < 9; k++) {
                    if (TsubBinaryTables[i][j][k]) {
                        setMiniCell(i, j, k + 1);
                    }
                }
            }
        }
    }
    if (nHyps < 2) {
        elsewhere();
    }
    else {
        var y = hyps[nHyps - 2][0][0];
        var x = hyps[nHyps - 2][0][1];
        if (markCopy[y][x]) {
            Marked[y][x] = 1;
            Tref[y][x].style.backgroundColor = wrongHypCol;
        }
        clickCell(Tref[y][x]);
    }
    hyps.pop();
    if (nHyps == 1) {
        disableHypRejection();
    }
}
function finishedHypChoosing() {
    if (choosingHyp == false)
        return;
    log("Stopping hypothesis choosing");
    enableSmallDigs();
    setActive("but1", false);
    choosingHyp = false;
}
function enableHypRejection() {
    setEnabled("but3", true);
    hypRejectionEnabled = true;
}
function disableHypRejection() {
    setEnabled("but3", false);
    hypRejectionEnabled = false;
}
function check() {
    if (solAvailable == false)
        return;
    console.log("Checking Sudoku: ");
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] != Tsol[i][j] && T[i][j] != 0) {
                console.log("Cell (".concat(i, ", ").concat(j, ") is incorrect!"));
                Tref[i][j].style.backgroundColor = wrongHypCol;
                Marked[i][j] = 1;
            }
        }
    }
}
function checkSolvedSud() {
    var slvd = checkSolved(T);
    if (!slvd) {
        return;
    }
    var vidSrc = "./assets/gifs/gj.mp4";
    var title = "You solved it!! :)";
    if (sudLvl == -2) {
        vidSrc = "./assets/gifs/uncivilized.mp4";
        title = "You used the solver :(";
    }
    else if (sudLvl == -1) {
        vidSrc = "./assets/gifs/thumbs_up.mp4";
        title = "You solved your own sudoku.";
    }
    else if (sudLvl == 0) {
        vidSrc = "./assets/gifs/yoda_fear.mp4";
        title = "Do not fear the harder ones.";
    }
    else if (sudLvl < 5) {
        vidSrc = "./assets/gifs/good.mp4";
        title = "Now try another one.";
    }
    else if (sudLvl == 8) {
        vidSrc = "./assets/gifs/unlim_power.mp4";
        title = "Nothing you can't solve.";
    }
    htmlButtonDict.get("fin-vid").src = vidSrc;
    getAssertedButton("solved-h").textContent = title;
    $("#win").popup("open");
}
function clickCell(cell) {
    unhighlightAll();
    var c = Number(cell.getAttribute("clickable"));
    var y = Number(cell.getAttribute("y"));
    var x = Number(cell.getAttribute("x"));
    var numSet = T[y][x] > 0;
    if (numSet) {
        highlight(y, x);
    }
    else {
        if (Marked[y][x] == 0) {
            Tref[y][x].style.backgroundColor = normH;
        }
    }
    curY = y;
    curX = x;
    var clickable = c == 1;
    if (clickable) {
        $("#digits").off("click", "**");
        var allowedArray = allowed(T, y, x, clickable);
        var d = new Array(10).fill(false);
        for (var i = 0; i < allowedArray.length; i++)
            d[allowedArray[i]] = true;
        if (numSet) {
            d[T[y][x]] = true;
        }
        d[0] = true;
        var _loop_2 = function (i) {
            if (d[i]) {
                var v_1 = i;
                digits[i].style.color = col1;
                digits[i].style.borderColor = col1;
                if (!choosingHyp || v_1 == 0) {
                    $("#digits").on("click", "#digit-" + String(i), function (e) {
                        log("Setting digit");
                        if (large || v_1 == 0) {
                            T[y][x] = v_1;
                            if (v_1 == 0) {
                                Tref[y][x].style.color = "var(--fg)";
                            }
                            else {
                                Tref[y][x].style.color = col1;
                            }
                        }
                        setCell(y, x, v_1, large, true, true);
                        if (v_1 == 0) {
                            clickCell(Tref[y][x]);
                        }
                        else if (large) {
                            unhighlightAll();
                            highlight(y, x);
                        }
                        checkSolvedSud();
                        e.stopPropagation();
                    });
                }
                else {
                    $("#digits").on("click", "#digit-" + String(i), function (e) {
                        if (!choosingHyp) {
                            e.stopPropagation();
                            return;
                        }
                        log("Saving current state");
                        var tCopy = deepCopy2D(T);
                        var tSubBinaryTablesCopy = deepCopy3D(TsubBinaryTables);
                        var hypTuple = [[y, x], tCopy, tSubBinaryTablesCopy];
                        hyps.push(hypTuple);
                        setClickableTrefT();
                        T[y][x] = v_1;
                        Tref[y][x].style.color = hypCol;
                        Tref[y][x].setAttribute("clickable", "0");
                        setCell(y, x, v_1, large, true);
                        clickCell(Tref[y][x]);
                        finishedHypChoosing();
                        enableHypRejection();
                        checkSolvedSud();
                        log("Saved current.");
                        e.stopPropagation();
                    });
                }
            }
            else {
                digits[i].style.color = "var(--disabled)";
                digits[i].style.borderColor = "var(--disabled)";
                $("#digits").on("click", "#digit-" + String(i), function (e) {
                    log("Cannot set this number!");
                    e.stopPropagation();
                });
            }
        };
        for (var i = 0; i < 10; i++) {
            _loop_2(i);
        }
    }
    else {
        $("#digits").off("click", "**");
        for (var i = 0; i < 10; i++) {
            digits[i].style.color = "var(--disabled)";
            digits[i].style.borderColor = "var(--disabled)";
        }
    }
}
function elsewhere() {
    log("Elsewhere");
    if (curX >= 0) {
        $("#digits").off("click", "**");
        curX = -1;
        unhighlightAll();
        for (var i = 0; i < digits.length; ++i) {
            digits[i].style.color = "var(--disabled)";
            digits[i].style.borderColor = "var(--disabled)";
            $("#digits").on("click", "#digit-" + String(i), function (e) {
                log("Neet to select a cell first.");
                e.stopPropagation();
            });
        }
    }
}
function setIfNotMarked(y, x) {
    if (Marked[y][x] == 0) {
        Tref[y][x].style.backgroundColor = rowColSquareForbidCol;
    }
}
function highlight(y, x) {
    log("highlighting");
    var currDig = T[y][x];
    var xFloor = x - (x % 3);
    var yFloor = y - (y % 3);
    for (var i = 0; i < 9; i++) {
        setIfNotMarked(y, i);
        setIfNotMarked(i, x);
        setIfNotMarked(yFloor + (i % 3), xFloor + Math.floor(i / 3));
        for (var j = 0; j < 9; j++) {
            if (T[i][j] == currDig) {
                if (Marked[i][j] == 0) {
                    Tref[i][j].style.backgroundColor = sameDigCol;
                }
            }
            if (T[i][j] == 0 && TsubBinaryTables[i][j][currDig - 1]) {
                Tref[i][j].style.backgroundColor = smallDigCol;
            }
        }
    }
    if (Marked[y][x] == 0) {
        Tref[y][x].style.backgroundColor = normH;
    }
}
function unhighlightAll() {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (Marked[i][j] == 0) {
                Tref[i][j].style.backgroundColor = "";
            }
        }
    }
}
function updateGrid(removeMarks) {
    if (removeMarks === void 0) { removeMarks = true; }
    log("Updating grid...");
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var currVal = T[i][j];
            var currMark = Marked[i][j];
            setCell(i, j, currVal, true, false);
            if (!removeMarks || (currVal > 0 && currMark != 0)) {
                Marked[i][j] = 1;
            }
            Tref[i][j].style.color = "";
            if (Marked[i][j] == 0) {
                Tref[i][j].style.backgroundColor = "";
            }
        }
    }
}
function setClickableTrefT() {
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] == 0)
                Tref[i][j].setAttribute("clickable", "1");
            else {
                Tref[i][j].setAttribute("clickable", "0");
                Tref[i][j].style.color = "";
            }
        }
    }
}
function setSudFromStr(retSud) {
    $("#newGrid").popup("close");
    $("#waiting").popup("open");
    var sudAndSolStr = retSud.substr(13, 324);
    var sStr = sudAndSolStr.substr(0, 162);
    var sSolStr = sudAndSolStr.substr(162, 162);
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var totIndT2 = 2 * (i * 9 + j);
            T[i][j] = parseInt(sStr.substr(totIndT2, 2));
            Tsol[i][j] = parseInt(sSolStr.substr(totIndT2, 2));
        }
    }
    permuteSuds(T, Tsol);
    copyTo2d(T, Tinit);
    if (!solAvailable)
        solAvailable = true;
    updateGrid();
    setClickableTrefT();
    clearHyps();
    $("#waiting").popup("close");
}
function disableSmallDigs() {
    log("Disabled pencil mark toggle");
    enlarge();
    smallDigsEnabled = false;
    setEnabled("mode-but", false);
}
function enableSmallDigs() {
    smallDigsEnabled = true;
    setEnabled("mode-but", true);
}
function inputCustomSudoku() {
    if (!inputtingOwnSud) {
        log("Own Input");
        clearHyps();
        disableHyp();
        inputtingOwnSud = true;
        solAvailable = false;
        setActive("own_sud", true);
        for (var i = 0; i < 9; i++) {
            for (var j = 0; j < 9; j++) {
                T[i][j] = 0;
                setCell(i, j, 0, true, false);
                Tref[i][j].style.color = "";
                Tref[i][j].style.backgroundColor = "";
                Tref[i][j].setAttribute("clickable", "1");
            }
        }
        disableSmallDigs();
    }
    else {
        log("Done inputting own sudoku!");
        enableHyp();
        sudLvl = -1;
        inputtingOwnSud = false;
        setActive("own_sud", false);
        copyTo2d(T, Tinit);
        setClickableTrefT();
        enableSmallDigs();
    }
}
function loadRandomSud(lvl) {
    if (lvl === void 0) { lvl = 7; }
    if (inputtingOwnSud) {
        inputCustomSudoku();
    }
    readSudokuFromFile(setSudFromStr, lvl);
    log("Loaded sudoku with level ".concat(lvl));
}
function setHypButtons() {
    setActive("but1", false);
    setEnabled("but1", true);
    setEnabled("but3", false);
}
function solve() {
    if (solAvailable == false)
        return;
    sudLvl = -2;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] == 0) {
                T[i][j] = Tsol[i][j];
                setCell(i, j, T[i][j]);
                Tref[i][j].style.color = "var(--disabled)";
            }
            else if (T[i][j] != Tsol[i][j]) {
                T[i][j] = Tsol[i][j];
                setCell(i, j, T[i][j]);
                Tref[i][j].style.color = "var(--disabled)";
                Tref[i][j].style.backgroundColor = "var(--same-bg)";
            }
        }
    }
    clearHyps();
    setHypButtons();
}
function clearHyps() {
    log("Clearing hypotheses");
    hyps = [];
    choosingHyp = false;
    setActive("but1", false);
    disableHypRejection();
}
function restart() {
    if (inputtingOwnSud) {
        inputCustomSudoku();
    }
    log("Restarting");
    unhighlightAll();
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (Tinit[i][j] == 0) {
                Tref[i][j].setAttribute("clickable", "1");
                T[i][j] = 0;
                Tref[i][j].style.backgroundColor = "";
                Tref[i][j].style.color = "";
                setCell(i, j, 0);
            }
        }
    }
    clearHyps();
    setHypButtons();
}
function fillSmallDigits() {
    log("Autofilling...");
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] == 0) {
                var a = allowed(T, i, j);
                for (var k = 0; k < a.length; k++) {
                    setMiniCell(i, j, a[k]);
                }
            }
        }
    }
    unhighlightAll();
}
export { enlarge, shrink, initGrid, htmlButtonDict, col1, digits, loadRandomSud, setButtons, log, elsewhere, clickCell, };
//# sourceMappingURL=html_util.js.map