import { T, DEBUG, Marked, read_sudoku_from_file, Tsol, Tinit, permuteSuds, copy_to_2d, allowed, checkSolved, deepCopy2D, deepCopy3D } from "./sudoku.js";
var col1 = "#0A85FF";
var smallDigCol = "#DFD";
var rowColSquareForbidCol = "#FDD";
var sameDigCol = "#FBB";
var hypCol = "#0C5";
var normH = "#BBB";
var wrongHypCol = "#F22";
var large = true;
var curX = -1;
var curY = 0;
var prev_cell = [curX, curY];
var sol_available = false;
var inputtingOwnSud = false;
var sudLvl;
var choosingHyp = false;
var hyp_rejection_enabled = false;
var hyps = [];
var Tref = Array.from(new Array(9), function () { return new Array(9); });
var digits = new Array(10);
var TsubHTMLTables = Array.from(new Array(9), function () { return new Array(9); });
var TsubBinaryTables = Array.from(new Array(9), function () { return new Array(9); });
var TminiCells = Array.from(new Array(9), function () { return new Array(9); });
var html_button_dict = new Map();
function log(msg) {
    if (DEBUG) {
        console.log(msg);
    }
}
function toggleLargeSmall() {
    var upBut = html_button_dict.get("up-but");
    var downBut = html_button_dict.get("down-but");
    var but2 = large ? upBut : downBut;
    var but1 = !large ? upBut : downBut;
    but1.style.color = col1;
    but1.style.borderColor = col1;
    but2.style.color = "black";
    but2.style.borderColor = "black";
    large = !large;
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
    e.stopPropagation();
}
function init_grid(tbl) {
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
            var sub_row = void 0;
            var sub_cell = void 0;
            for (var k = 0; k < 9; k++) {
                if (k % 3 == 0) {
                    sub_row = subTab.insertRow(-1);
                    sub_row.className = "gridRow";
                }
                sub_cell = sub_row.insertCell(-1);
                sub_cell.innerHTML = "";
                sub_cell.className = "subGridCell";
                TminiCells[i][j][k] = sub_cell;
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
function set_level_fun() {
    var ul_el = html_button_dict.get("lvl_list");
    var kids = ul_el.childNodes;
    var n_kids = kids.length;
    var ct = 0;
    var _loop_1 = function (k) {
        var inn_html = kids[k].innerHTML;
        if (inn_html) {
            var n_1 = parseInt(inn_html.split(" ")[1]);
            kids[k].addEventListener("click", function () { return loadRandomSud(n_1); });
            ++ct;
        }
    };
    for (var k = 0; k < n_kids; ++k) {
        _loop_1(k);
    }
}
function start_hyp(e) {
    hypothesis1();
    e.stopPropagation();
}
function set_buttons() {
    var up_but = html_button_dict.get("up-but");
    up_but.style.color = col1;
    up_but.style.borderColor = col1;
    up_but.addEventListener("click", enlarge);
    enableSmallDigs();
    function rest_and_close(e) {
        restart();
        $("#restart").popup("close");
        e.stopPropagation();
    }
    html_button_dict.get("restart_but").addEventListener("click", rest_and_close);
    html_button_dict
        .get("auto-fill-button")
        .addEventListener("click", fillSmallDigits);
    html_button_dict.get("own_sud").addEventListener("click", input_own_sudoku);
    enable_hyp();
    disableHypRejection();
    html_button_dict.get("but3").addEventListener("click", end_hyp);
    html_button_dict.get("digits").style.display = "none";
    html_button_dict.get("digits").style.display = "inline-block";
    html_button_dict.get("buttons1").style.display = "none";
    set_level_fun();
    function solve_and_close() {
        solve();
        $("#help").popup("close");
    }
    html_button_dict.get("solve").addEventListener("click", solve_and_close);
    function check_and_close() {
        check();
        $("#help").popup("close");
    }
    html_button_dict.get("check").addEventListener("click", check_and_close);
}
function disable_hyp() {
    html_button_dict.get("but1").onclick = null;
    html_button_dict.get("but1").style.color = "#B8B8B8";
}
function enable_hyp() {
    html_button_dict.get("but1").onclick = start_hyp;
    html_button_dict.get("but1").style.color = "#000";
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
function setCell(y, x, n, largeMode, highlightCells, remove_red) {
    if (largeMode === void 0) { largeMode = true; }
    if (highlightCells === void 0) { highlightCells = false; }
    if (remove_red === void 0) { remove_red = false; }
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
            if (remove_red) {
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
        log("Choosing " + (hyps.length + 1) + "-th hypothesis.");
        disableSmallDigs();
        html_button_dict.get("but1").style.color = "#F00";
        choosingHyp = true;
        log("Started choosing, curX = " + curX);
        if (curX >= 0) {
            clickCell(Tref[curY][curX]);
        }
    }
    else {
        finishedHypChoosing();
    }
}
function end_hyp(e) {
    if (hyp_rejection_enabled) {
        hypothesis3();
    }
    e.stopPropagation();
}
function hypothesis3() {
    var nHyps = hyps.length;
    if (nHyps < 1)
        return;
    var lastHyp = hyps[nHyps - 1];
    log("N hyps: " + nHyps);
    var mark_copy = deepCopy2D(Marked);
    if (nHyps < 2) {
        copy_to_2d(Tinit, T);
        updateGrid();
        setClickableTrefT();
    }
    else {
        copy_to_2d(hyps[nHyps - 2][1], T);
        updateGrid();
        setClickableTrefT();
        var y = hyps[nHyps - 2][0][0];
        var x = hyps[nHyps - 2][0][1];
        Tref[y][x].style.color = hypCol;
        Tref[y][x].setAttribute("clickable", "0");
    }
    copy_to_2d(lastHyp[1], T);
    TsubBinaryTables = lastHyp[2];
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] > 0) {
                var m = mark_copy[i][j];
                setCell(i, j, T[i][j], true, false);
                if (Tref[i][j].getAttribute("clickable") == "1") {
                    Tref[i][j].style.color = col1;
                    if (m > 0) {
                        Tref[i][j].style.backgroundColor = wrongHypCol;
                        Marked[i][j] = 1;
                        log("m is " + m + ", setting (" + i + ", " + j + ")");
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
        if (mark_copy[y][x]) {
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
    html_button_dict.get("but1").style.color = "";
    choosingHyp = false;
}
function enableHypRejection() {
    var rejBut = html_button_dict.get("but3");
    rejBut.style.color = "#000";
    hyp_rejection_enabled = true;
}
function disableHypRejection() {
    var rejBut = html_button_dict.get("but3");
    rejBut.style.color = "#B8B8B8";
    hyp_rejection_enabled = false;
}
function check() {
    if (sol_available == false)
        return;
    console.log("Checking Sudoku: ");
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var tot_ind = i * 9 + j;
            if (T[i][j] != Tsol[i][j] && T[i][j] != 0) {
                console.log("Cell (" + i + ", " + j + ") is incorrect!");
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
    var vid_src = "./gifs/gj.mp4";
    var title = "You solved it!! :)";
    if (sudLvl == -2) {
        vid_src = "./gifs/uncivilized.mp4";
        title = "You used the solver :(";
    }
    else if (sudLvl == -1) {
        vid_src = "./gifs/thumbs_up.mp4";
        title = "You solved your own sudoku.";
    }
    else if (sudLvl == 0) {
        vid_src = "./gifs/yoda_fear.mp4";
        title = "Do not fear the harder ones.";
    }
    else if (sudLvl < 5) {
        vid_src = "./gifs/good.mp4";
        title = "Now try another one.";
    }
    else if (sudLvl == 8) {
        vid_src = "./gifs/unlim_power.mp4";
        title = "Nothing you can't solve.";
    }
    html_button_dict.get("fin-vid").src = vid_src;
    html_button_dict.get("solved-h").src = title;
    $("#win").popup("open");
    console.log(sudLvl);
}
function clickCell(cell) {
    unhighlightAll();
    var c = Number(cell.getAttribute("clickable"));
    var y = Number(cell.getAttribute("y"));
    var x = Number(cell.getAttribute("x"));
    if (T[y][x] > 0) {
        highlight(y, x);
    }
    else {
        if (Marked[y][x] == 0) {
            Tref[y][x].style.backgroundColor = normH;
        }
    }
    curY = y;
    curX = x;
    prev_cell = [x, y];
    log("Selected " + c + " cell (" + curY + ", " + curX + ")");
    var clickable = c == 1;
    if (clickable) {
        $("#digits").off("click", "**");
        var a = allowed(T, y, x, clickable);
        var d = new Array(10).fill(false);
        for (var i = 0; i < a.length; i++)
            d[a[i]] = true;
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
                                Tref[y][x].style.color = "#000";
                            }
                            else {
                                Tref[y][x].style.color = col1;
                            }
                        }
                        setCell(y, x, v_1, large, true, true);
                        if (v_1 == 0) {
                            clickCell(Tref[y][x]);
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
                        var T_copy = deepCopy2D(T);
                        var TsubBinaryTables_copy = deepCopy3D(TsubBinaryTables);
                        var hypTuple = [[y, x], T_copy, TsubBinaryTables_copy];
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
                digits[i].style.color = "#B8B8B8";
                digits[i].style.borderColor = "#B8B8B8";
                digits[i].style.cursor = "pointer";
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
            digits[i].style.color = "#B8B8B8";
            digits[i].style.borderColor = "#B8B8B8";
            digits[i].style.cursor = "pointer";
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
            digits[i].style.color = "#B8B8B8";
            digits[i].style.borderColor = "#B8B8B8";
            digits[i].style.cursor = "pointer";
            $("#digits").on("click", "#digit-" + String(i), function (e) {
                log("Neet to select a cell first.");
                e.stopPropagation();
            });
        }
    }
}
function set_if_not_marked(y, x) {
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
        set_if_not_marked(y, i);
        set_if_not_marked(i, x);
        set_if_not_marked(yFloor + (i % 3), xFloor + Math.floor(i / 3));
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
function updateGrid(remove_marks) {
    if (remove_marks === void 0) { remove_marks = true; }
    log("Updating grid...");
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var curr_val = T[i][j];
            var curr_mark = Marked[i][j];
            setCell(i, j, curr_val, true, false);
            if (!remove_marks || (curr_val > 0 && curr_mark != 0)) {
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
function set_sud_from_str(ret_sud) {
    $("#newGrid").popup("close");
    $("#waiting").popup("open");
    var s_and_sol_str = ret_sud.substr(13, 324);
    var s_str = s_and_sol_str.substr(0, 162);
    var s_sol_str = s_and_sol_str.substr(162, 162);
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            var tot_ind_t2 = 2 * (i * 9 + j);
            var e_s = parseInt(s_str.substr(tot_ind_t2, 2));
            var e_sol = parseInt(s_sol_str.substr(tot_ind_t2, 2));
            T[i][j] = e_s;
            Tsol[i][j] = e_sol;
        }
    }
    permuteSuds(T, Tsol);
    copy_to_2d(T, Tinit);
    if (!sol_available)
        sol_available = true;
    updateGrid();
    setClickableTrefT();
    clear_hyps();
    $("#waiting").popup("close");
}
function disableSmallDigs() {
    log("Disabled down button");
    enlarge();
    var down_but = html_button_dict.get("down-but");
    down_but.onclick = null;
    down_but.style.color = "#B8B8B8";
    down_but.style.borderColor = "#B8B8B8";
    down_but.style.cursor = "pointer";
}
function enableSmallDigs() {
    var down_but = html_button_dict.get("down-but");
    down_but.onclick = shrink;
    down_but.style.color = "";
    down_but.style.borderColor = "";
}
function input_own_sudoku() {
    if (!inputtingOwnSud) {
        log("Own Input");
        clear_hyps();
        disable_hyp();
        inputtingOwnSud = true;
        sol_available = false;
        var own_but = html_button_dict.get("own_sud");
        own_but.style.color = "#F00";
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
        enable_hyp();
        sudLvl = -1;
        inputtingOwnSud = false;
        var own_but = html_button_dict.get("own_sud");
        own_but.style.color = "";
        copy_to_2d(T, Tinit);
        setClickableTrefT();
        enableSmallDigs();
    }
}
function loadRandomSud(lvl) {
    if (lvl === void 0) { lvl = 7; }
    if (inputtingOwnSud) {
        input_own_sudoku();
    }
    read_sudoku_from_file(set_sud_from_str, lvl);
    log("Loaded sudoku with level " + lvl);
}
function set_hyp_buttons() {
    html_button_dict.get("but1").style.color = "#000";
    html_button_dict.get("but3").style.color = "#B8B8B8";
}
function solve() {
    if (sol_available == false)
        return;
    sudLvl = -2;
    for (var i = 0; i < 9; i++) {
        for (var j = 0; j < 9; j++) {
            if (T[i][j] == 0) {
                T[i][j] = Tsol[i][j];
                setCell(i, j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
            }
            else if (T[i][j] != Tsol[i][j]) {
                T[i][j] = Tsol[i][j];
                setCell(i, j, T[i][j]);
                Tref[i][j].style.color = "#B8B8B8";
                Tref[i][j].style.backgroundColor = "#FBB";
            }
        }
    }
    clear_hyps();
    set_hyp_buttons();
}
function clear_hyps() {
    log("Clearing hypotheses");
    hyps = [];
    choosingHyp = false;
    disableHypRejection();
}
function restart() {
    if (inputtingOwnSud) {
        input_own_sudoku();
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
    clear_hyps();
    set_hyp_buttons();
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
export { enlarge, shrink, init_grid, html_button_dict, col1, digits, loadRandomSud, set_buttons, log, elsewhere, clickCell };
//# sourceMappingURL=html_util.js.map