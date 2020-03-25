// Import sudoku module
import {
  T,
  DEBUG,
  Marked,
  read_sudoku_from_file,
  Tsol,
  Tinit,
  permuteSuds,
  copy_to_2d,
  allowed,
  checkSolved,
  deepCopy2D,
  deepCopy3D
} from "./sudoku.js";

// Colors
const col1 = "#0A85FF";
const veryLightH = "#EEE";
const smallDigCol = "#DFD";
const rowColSquareForbidCol = "#FDD";
const sameDigCol = "#FBB";
const hypCol = "#0C5";
const lightH = "#FDD";
const normH = "#BBB";
const wrongCol = "#F00";
const wrongHypCol = "#B00";

// State variables
var large = true;
var curX = -1;
var curY = 0;
var prev_cell = [curX, curY]; // Stores the least recently clicked cell
var sol_available = false;
var inputtingOwnSud = false;
var sudLvl: number;
var hyp = false;
var choosingHyp = false;
var hyp_rejection_enabled = false;

var hyps: any[][][] = [];

// Array with html table cell elements
var Tref: HTMLTableCellElement[][] = Array.from(
  new Array(9),
  () => new Array(9)
);

// Array with digit buttons
var digits = new Array(10);

// Pencil mark marker arrays
var TsubHTMLTables = Array.from(new Array(9), () => new Array(9));
var TsubBinaryTables: boolean[][][] = Array.from(
  new Array(9),
  () => new Array(9)
);
var TminiCells = Array.from(new Array(9), () => new Array(9));

// Map containing html elements
var html_button_dict: Map<string, HTMLElement> = new Map();

// Logging
function log(msg: string) {
  if (DEBUG) {
    console.log(msg);
  }
}

// Change digit input mode
function toggleLargeSmall() {
  let upBut = html_button_dict.get("up-but");
  let downBut = html_button_dict.get("down-but");
  const but2 = large ? upBut : downBut;
  const but1 = !large ? upBut : downBut;
  but1.style.color = col1;
  but1.style.borderColor = col1;
  but2.style.color = "black";
  but2.style.borderColor = "black";
  large = !large;
}
function enlarge(e: Event = undefined) {
  if (!large) {
    toggleLargeSmall();
    log("enlarged");
  }
  if (e) e.stopPropagation();
}
function shrink(e: Event = undefined) {
  if (large) {
    toggleLargeSmall();
    log("shrunken");
  }
  e.stopPropagation();
}

// Initialize grid
function init_grid(tbl: HTMLTableElement) {
  // Build html structure
  for (let i = 0; i < 9; i++) {
    const row = tbl.insertRow(-1);
    row.className = "gridRow";
    for (let j = 0; j < 9; j++) {
      Tref[i][j] = row.insertCell(-1);
      Tref[i][j].className = "gridCell";
      if (i % 3 == 0) Tref[i][j].className += " topBorder";
      if (i % 3 == 2) Tref[i][j].className += " bottomBorder";
      if (j % 3 == 0) Tref[i][j].className += " leftBorder";
      if (j % 3 == 2) Tref[i][j].className += " rightBorder";
      const y = document.createAttribute("y");
      const x = document.createAttribute("x");
      const click = document.createAttribute("clickable");
      const subTab = document.createElement("table");
      click.value = "0";
      y.value = i.toString();
      x.value = j.toString();
      Tref[i][j].setAttributeNode(y);
      Tref[i][j].setAttributeNode(x);
      Tref[i][j].setAttributeNode(click);

      TminiCells[i][j] = new Array(9);
      subTab.className = "innerTable";
      let sub_row: HTMLTableRowElement;
      let sub_cell: HTMLTableCellElement;
      for (let k = 0; k < 9; k++) {
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

  // Load sudoku
  setTimeout(function() {
    loadRandomSud(4);
  }, 250);
}

// Set the onclick method for choosing new level
function set_level_fun() {
  const ul_el = html_button_dict.get("lvl_list");
  const kids = ul_el.childNodes;
  const n_kids = kids.length;
  let ct = 0;
  for (let k = 0; k < n_kids; ++k) {
    let inn_html = (kids[k] as HTMLElement).innerHTML;
    if (inn_html) {
      let n = parseInt(inn_html.split(" ")[1]);
      kids[k].addEventListener("click", () => loadRandomSud(n));
      ++ct;
    }
  }
}

function start_hyp(e: Event) {
  hypothesis1();
  e.stopPropagation();
}

// Sets functionality to the buttons
function set_buttons() {
  // Up button
  let up_but = html_button_dict.get("up-but");
  up_but.style.color = col1;
  up_but.style.borderColor = col1;
  up_but.addEventListener("click", enlarge);

  // Down button
  enableSmallDigs();

  // Restart button
  function rest_and_close(e: Event) {
    restart();
    ($("#restart") as any).popup("close");
    e.stopPropagation();
  }
  html_button_dict.get("restart_but").addEventListener("click", rest_and_close);

  // Autofill button
  html_button_dict
    .get("auto-fill-button")
    .addEventListener("click", fillSmallDigits);

  // Custom sudoku import
  html_button_dict.get("own_sud").addEventListener("click", input_own_sudoku);

  // Hypothesis
  //set_hyp_buttons();
  enable_hyp();
  disableHypRejection();
  html_button_dict.get("but3").addEventListener("click", end_hyp);

  html_button_dict.get("digits").style.display = "none";
  html_button_dict.get("digits").style.display = "inline-block";
  html_button_dict.get("buttons1").style.display = "none";

  // Select levels
  set_level_fun();

  // Solver
  function solve_and_close() {
    solve();
    ($("#help") as any).popup("close");
  }
  html_button_dict.get("solve").addEventListener("click", solve_and_close);

  // Check
  function check_and_close() {
    check();
    ($("#help") as any).popup("close");
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

// Removes digit in mini cell
function resetMiniCell(y: number, x: number, n: number) {
  TminiCells[y][x][n - 1].innerHTML = "";
  TsubBinaryTables[y][x][n - 1] = false;
}
// Puts digit in mini cell
function setMiniCell(y: number, x: number, n: number): void {
  TminiCells[y][x][n - 1].innerHTML = n.toString();
  TsubBinaryTables[y][x][n - 1] = true;
}
// Add small digit if not yet present, else remove it
function toggleMiniCell(y: number, x: number, n: number) {
  const alreadySet = TsubBinaryTables[y][x][n - 1];
  if (alreadySet) {
    TminiCells[y][x][n - 1].innerHTML = "";
  } else {
    TminiCells[y][x][n - 1].innerHTML = n.toString();
  }
  TsubBinaryTables[y][x][n - 1] = !alreadySet;
}

// Removes small digits that become inadmissible after setting
// (y, x) to n.
function eliminateSmallDigs(y: number, x: number, n: number) {
  const xFloor = x - (x % 3);
  const yFloor = y - (y % 3);
  for (let i = 0; i < 9; i++) {
    // Rows and Cols
    resetMiniCell(y, i, n);
    resetMiniCell(i, x, n);
    // Square
    resetMiniCell(yFloor + (i % 3), xFloor + Math.floor(i / 3), n);
  }
}

// Set cell (y, x) with value n (0 for empty cell)
function setCell(
  y: number,
  x: number,
  n: number,
  largeMode = true,
  highlightCells = false,
  remove_red = false,
) {
  //log(`Setting cell (${x}, ${y})`);
  if (n == 0) {
    // Remove all if only small digits present
    Tref[y][x].innerHTML = "";
    Tref[y][x].appendChild(TsubHTMLTables[y][x]);
    for (let i = 0; i < 9; i++) {
      resetMiniCell(y, x, i + 1);
    }
    Marked[y][x] = 0;
  } else {
    if (largeMode) {
      Tref[y][x].innerHTML = n.toString();
      eliminateSmallDigs(y, x, n);
      if (highlightCells) highlight(y, x);
      if(remove_red){
        Marked[y][x] = 0;
        Tref[y][x].style.backgroundColor = normH;
      }
    } else {
      toggleMiniCell(y, x, n);
    }
  }
}

// Start choosing hypothesis digit
function hypothesis1() {
  if (!choosingHyp) {
    // Choose hypothesis digit
    log(`Choosing ${hyps.length + 1}-th hypothesis.`);
    disableSmallDigs();
    html_button_dict.get("but1").style.color = "#F00";
    choosingHyp = true;
    log(`Started choosing, curX = ${curX}`);
    if (curX >= 0) {
      clickCell(Tref[curY][curX]);
    }
  } else {
    // Cancel choosing a hypothesis digit
    finishedHypChoosing();
  }
  log("chH after hypothesis1: " + choosingHyp.toString());
}

function end_hyp(e: Event) {
  if (hyp_rejection_enabled) {
    hypothesis3();
  }
  e.stopPropagation();
}

// Revert to previous hypothesis
function hypothesis3() {
  const nHyps = hyps.length;
  if (nHyps < 1) return;
  var lastHyp = hyps[nHyps - 1];
  log(`N hyps: ${nHyps}`);
  const mark_copy = deepCopy2D(Marked);

  // Set fixed digits
  if (nHyps < 2) {
    copy_to_2d(Tinit, T);
    updateGrid();
    setClickableTrefT();
  } else {
    copy_to_2d(hyps[nHyps - 2][1], T);
    updateGrid();
    setClickableTrefT();
    // TODO: Prev. Hyp
    const y = hyps[nHyps - 2][0][0];
    const x = hyps[nHyps - 2][0][1];
    Tref[y][x].style.color = hypCol;
    Tref[y][x].setAttribute("clickable", "0");
  }
  // Current uncertain digits
  copy_to_2d(lastHyp[1], T);
  TsubBinaryTables = lastHyp[2];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (T[i][j] > 0) {
        const m = mark_copy[i][j];
        setCell(i, j, T[i][j], true, false);
        if (Tref[i][j].getAttribute("clickable") == "1") {
          Tref[i][j].style.color = col1;
          if(m > 0){
            Tref[i][j].style.backgroundColor = wrongHypCol;
            Marked[i][j] = 1;
            log(`m is ${m}, setting (${i}, ${j})`);
          }
        }
      } else {
        for (let k = 0; k < 9; k++) {
          if (TsubBinaryTables[i][j][k]) {
            setMiniCell(i, j, k + 1);
          }
        }
      }
    }
  }

  // Select cell
  if (nHyps < 2) {
    elsewhere();
  } else {
    const y = hyps[nHyps - 2][0][0];
    const x = hyps[nHyps - 2][0][1];    
    if(mark_copy[y][x]){
      Marked[y][x] = 1;
      Tref[y][x].style.backgroundColor = wrongHypCol;
    }
    clickCell(Tref[y][x]);
  }

  // Remove rejected hypothesis
  hyps.pop();
  if (nHyps == 1) {
    disableHypRejection();
  }
}

// Enable shrink mode
function finishedHypChoosing() {
  if (choosingHyp == false) return;
  log("Stopping hypothesis choosing");
  enableSmallDigs();
  html_button_dict.get("but1").style.color = "";
  choosingHyp = false;
}

// Enable / disable the hypothesis rejection button
function enableHypRejection() {
  const rejBut = html_button_dict.get("but3");
  rejBut.style.color = "#000";
  hyp_rejection_enabled = true;
}
function disableHypRejection() {
  const rejBut = html_button_dict.get("but3");
  rejBut.style.color = "#B8B8B8";
  hyp_rejection_enabled = false;
}

// Checks if any input digits are wrong and sets their background to
// red.
function check() {
  if (sol_available == false) return;
  console.log("Checking Sudoku: ");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const tot_ind = i * 9 + j;
      if (T[i][j] != Tsol[i][j] && T[i][j] != 0) {
        console.log(`Cell (${i}, ${j}) is incorrect!`);
        Tref[i][j].style.backgroundColor = wrongHypCol;
        Marked[i][j] = 1;
      }
    }
  }
}

// Check if sudoku was solved
function checkSolvedSud() {
  const slvd = checkSolved(T);
  if (!slvd) {
    return;
  }
  let vid_src = "./gifs/gj.mp4";
  let title = "You solved it!! :)";
  if (sudLvl == -2) {
    vid_src = "./gifs/uncivilized.mp4";
    title = "You used the solver :(";
  } else if (sudLvl == -1) {
    vid_src = "./gifs/thumbs_up.mp4";
    title = "You solved your own sudoku.";
  } else if (sudLvl == 0) {
    vid_src = "./gifs/yoda_fear.mp4";
    title = "Do not fear the harder ones.";
  } else if (sudLvl < 5) {
    vid_src = "./gifs/good.mp4";
    title = "Now try another one.";
  } else if (sudLvl == 8) {
    vid_src = "./gifs/unlim_power.mp4";
    title = "Nothing you can't solve.";
  }
  (html_button_dict.get("fin-vid") as HTMLVideoElement).src = vid_src;
  (html_button_dict.get("solved-h") as HTMLVideoElement).src = title;
  ($("#win") as any).popup("open");
  console.log(sudLvl);
}

// Executed when cell is clicked
function clickCell(cell: HTMLTableCellElement) {
  unhighlightAll();
  const c = Number(cell.getAttribute("clickable"));
  const y = Number(cell.getAttribute("y"));
  const x = Number(cell.getAttribute("x"));
  if (T[y][x] > 0) { // If number in cell is set
    highlight(y, x);
  } else {
    if (Marked[y][x] == 0) {
      Tref[y][x].style.backgroundColor = normH;
    }
  }
  curY = y;
  curX = x;
  prev_cell = [x, y];
  log(`Selected ${c} cell (${curY}, ${curX})`);
  const clickable = c == 1;
  if (clickable) { // If Cell is clickable
    $("#digits").off("click", "**");
    // Enable all digits that are admissible
    var a = allowed(T, y, x, clickable);
    var d = new Array(10).fill(false);
    for (let i = 0; i < a.length; i++) d[a[i]] = true;
    d[0] = true;
    for (let i = 0; i < 10; i++) {
      if (d[i]) {
        const v = i;
        digits[i].style.color = col1;
        digits[i].style.borderColor = col1;
        if (!choosingHyp || v == 0) {
          $("#digits").on("click", "#digit-" + String(i), function(e) {
            log("Setting digit");
            if (large || v == 0) {
              T[y][x] = v;
              if (v == 0) {
                Tref[y][x].style.color = "#000";
              } else {
                Tref[y][x].style.color = col1;
              }
            }
            setCell(y, x, v, large, true, true);
            if (v == 0) {
              clickCell(Tref[y][x]); // Depth one recursion
            }
            checkSolvedSud();
            e.stopPropagation();
          });
        } else {
          $("#digits").on("click", "#digit-" + String(i), function(e) {
            // Save current version
            if (!choosingHyp) {
              e.stopPropagation();
              return;
            }
            log("Saving current state");
            const T_copy = deepCopy2D(T);
            const TsubBinaryTables_copy = deepCopy3D(TsubBinaryTables);
            const hypTuple = [[y, x], T_copy, TsubBinaryTables_copy];
            hyps.push(hypTuple);
            setClickableTrefT();
            T[y][x] = v;
            Tref[y][x].style.color = hypCol;
            Tref[y][x].setAttribute("clickable", "0");
            setCell(y, x, v, large, true);
            clickCell(Tref[y][x]); // Depth one recursion
            finishedHypChoosing();
            enableHypRejection();
            checkSolvedSud();
            log("Saved current.");
            e.stopPropagation();
          });
        }
      } else {
        digits[i].style.color = "#B8B8B8";
        digits[i].style.borderColor = "#B8B8B8";
        digits[i].style.cursor = "pointer";
        $("#digits").on("click", "#digit-" + String(i), function(e) {
          log("Cannot set this number!");
          e.stopPropagation();
        });
      }
    }
  } else {
    $("#digits").off("click", "**");
    for (let i = 0; i < 10; i++) {
      digits[i].style.color = "#B8B8B8";
      digits[i].style.borderColor = "#B8B8B8";
      digits[i].style.cursor = "pointer";
    }
    //elsewhere();
  }
}

// When the user clicks anywhere
function elsewhere() {
  log("Elsewhere");
  if (curX >= 0) {
    $("#digits").off("click", "**");
    curX = -1;
    unhighlightAll();
    for (let i = 0; i < digits.length; ++i) {
      digits[i].style.color = "#B8B8B8";
      digits[i].style.borderColor = "#B8B8B8";
      digits[i].style.cursor = "pointer";
      $("#digits").on("click", "#digit-" + String(i), function(e) {
        log("Neet to select a cell first.");
        e.stopPropagation();
      });
    }
  }
}

function set_if_not_marked(y: number, x: number) {
  if (Marked[y][x] == 0) {
    Tref[y][x].style.backgroundColor = rowColSquareForbidCol;
  }
}

// Highlight the current cell and all same numbers in grid
function highlight(y: number, x: number) {
  log("highlighting");
  var currDig = T[y][x];
  var xFloor = x - (x % 3);
  var yFloor = y - (y % 3);
  for (let i = 0; i < 9; i++) {
    set_if_not_marked(y, i);
    set_if_not_marked(i, x);
    set_if_not_marked(yFloor + (i % 3), xFloor + Math.floor(i / 3));
    for (let j = 0; j < 9; j++) {
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

// Unhighlights all cells
function unhighlightAll() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (Marked[i][j] == 0) {
        Tref[i][j].style.backgroundColor = "";
      }
    }
  }
}

// Sets layout according to T
// Removes marks where T is not set (= 0)
function updateGrid(remove_marks = true) {
  log("Updating grid...");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const curr_val =  T[i][j];
      const curr_mark = Marked[i][j];
      setCell(i, j, curr_val, true, false);
      if(!remove_marks || (curr_val > 0 && curr_mark != 0)){
        Marked[i][j] = 1;
      }
      Tref[i][j].style.color = "";
      if(Marked[i][j] == 0){
        Tref[i][j].style.backgroundColor = "";
      }
    }
  }
}

// Makes the cells clickable
function setClickableTrefT() {
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (T[i][j] == 0) Tref[i][j].setAttribute("clickable", "1");
      else {
        Tref[i][j].setAttribute("clickable", "0");
        Tref[i][j].style.color = "";
      }
    }
  }
}

// Sets the sudoku to the one specified with the string 'ret_sud'.
function set_sud_from_str(ret_sud: string) {
  ($("#newGrid") as any).popup("close");
  ($("#waiting") as any).popup("open");

  const s_and_sol_str = ret_sud.substr(13, 324);
  const s_str = s_and_sol_str.substr(0, 162);
  const s_sol_str = s_and_sol_str.substr(162, 162);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const tot_ind_t2 = 2 * (i * 9 + j);
      let e_s = parseInt(s_str.substr(tot_ind_t2, 2));
      let e_sol = parseInt(s_sol_str.substr(tot_ind_t2, 2));
      T[i][j] = e_s;
      Tsol[i][j] = e_sol;
    }
  }

  // Shuffle
  permuteSuds(T, Tsol);
  copy_to_2d(T, Tinit);
  if (!sol_available) sol_available = true;
  updateGrid();
  setClickableTrefT();
  clear_hyps();
  ($("#waiting") as any).popup("close");
}

// Disables down button
function disableSmallDigs() {
  log("Disabled down button");
  enlarge();
  var down_but = html_button_dict.get("down-but");
  down_but.onclick = null;
  down_but.style.color = "#B8B8B8";
  down_but.style.borderColor = "#B8B8B8";
  down_but.style.cursor = "pointer";
}
// Enables down button
function enableSmallDigs() {
  var down_but = html_button_dict.get("down-but");
  down_but.onclick = shrink;
  down_but.style.color = "";
  down_but.style.borderColor = "";
}

// Lets the user input a custom sudoku
function input_own_sudoku() {
  if (!inputtingOwnSud) {
    log("Own Input");
    clear_hyps();
    disable_hyp();

    // Toggle State and Button color
    inputtingOwnSud = true;
    sol_available = false;
    var own_but = html_button_dict.get("own_sud");
    own_but.style.color = "#F00";

    // Remove current sudoku
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        T[i][j] = 0;
        setCell(i, j, 0, true, false);
        Tref[i][j].style.color = "";
        Tref[i][j].style.backgroundColor = "";
        Tref[i][j].setAttribute("clickable", "1");
      }
    }
    disableSmallDigs();
  } else {
    log("Done inputting own sudoku!");
    enable_hyp();
    sudLvl = -1;

    // Toggle State
    inputtingOwnSud = false;
    var own_but = html_button_dict.get("own_sud");
    own_but.style.color = "";

    // Activate small numbers and set set numbers to unclickable
    copy_to_2d(T, Tinit);
    setClickableTrefT();
    enableSmallDigs();
  }
}

// Reads a random sudoku from the file and loads it.
function loadRandomSud(lvl = 7) {
  if (inputtingOwnSud) {
    input_own_sudoku();
  }
  read_sudoku_from_file(set_sud_from_str, lvl);
  log(`Loaded sudoku with level ${lvl}`);
}

// Setup hypothesis buttons
function set_hyp_buttons() {
  html_button_dict.get("but1").style.color = "#000";
  html_button_dict.get("but3").style.color = "#B8B8B8";
}

// Sets the current sudoku to the solution.
function solve() {
  if (sol_available == false) return;
  sudLvl = -2;
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (T[i][j] == 0) {
        T[i][j] = Tsol[i][j];
        setCell(i, j, T[i][j]);
        Tref[i][j].style.color = "#B8B8B8";
      } else if (T[i][j] != Tsol[i][j]) {
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

// Restart
function restart() {
  if (inputtingOwnSud) {
    input_own_sudoku();
  }
  log("Restarting");
  unhighlightAll();
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
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

// Autofill
function fillSmallDigits() {
  log("Autofilling...");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (T[i][j] == 0) {
        // Enable all digits that are admissible
        var a = allowed(T, i, j);
        for (let k = 0; k < a.length; k++) {
          setMiniCell(i, j, a[k]);
        }
      }
    }
  }
  unhighlightAll();
}

// Export
export {
  enlarge,
  shrink,
  init_grid,
  html_button_dict,
  col1,
  digits,
  loadRandomSud,
  set_buttons,
  log,
  elsewhere,
  clickCell
};
