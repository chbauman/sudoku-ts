// Import sudoku module
import {
  T,
  DEBUG,
  Marked,
  readSudokuFromFile,
  Tsol,
  Tinit,
  permuteSuds,
  copyTo2d,
  allowed,
  checkSolved,
  deepCopy2D,
  deepCopy3D,
} from "./sudoku";

// Colors
const col1 = "#0A85FF";
const smallDigCol = "#DFD";
const rowColSquareForbidCol = "#FDD";
const sameDigCol = "#FBB";
const hypCol = "#0C5";
const normH = "#BBB";
const wrongHypCol = "#F22";

// State variables
var large = true;
var curX = -1;
var curY = 0;
var solAvailable = false;
var inputtingOwnSud = false;
var sudLvl: number;
var choosingHyp = false;
var hypRejectionEnabled = false;

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
var htmlButtonDict: Map<string, HTMLElement> = new Map();
const getAssertedButton = (name: string) => {
  const res = htmlButtonDict.get(name);
  if (res === undefined) {
    throw new Error("Undefined button!");
  }
  return res;
};

// Logging
function log(msg: string) {
  if (DEBUG) {
    console.log(msg);
  }
}

// Change digit input mode
function toggleLargeSmall() {
  const upBut = getAssertedButton("up-but");
  const downBut = getAssertedButton("down-but");
  const but2 = large ? upBut : downBut;
  const but1 = !large ? upBut : downBut;
  but1.style.color = col1;
  but1.style.borderColor = col1;
  but2.style.color = "black";
  but2.style.borderColor = "black";
  large = !large;
}
function enlarge(e: Event | undefined = undefined) {
  if (!large) {
    toggleLargeSmall();
    log("enlarged");
  }
  if (e) e.stopPropagation();
}
function shrink(e: Event | undefined = undefined) {
  if (large) {
    toggleLargeSmall();
    log("shrunken");
  }
  if (e) e.stopPropagation();
}

// Initialize grid
function initGrid(tbl: HTMLTableElement) {
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
      let subRow: HTMLTableRowElement | null = null;
      let subCell: HTMLTableCellElement;
      for (let k = 0; k < 9; k++) {
        if (k % 3 == 0) {
          subRow = subTab.insertRow(-1);
          subRow.className = "gridRow";
        }
        subCell = subRow!.insertCell(-1);
        subCell.innerHTML = "";
        subCell.className = "subGridCell";
        TminiCells[i][j][k] = subCell;
      }
      Tref[i][j].appendChild(subTab);

      TsubHTMLTables[i][j] = subTab;
      TsubBinaryTables[i][j] = new Array(9).fill(false);
    }
  }

  // Load sudoku
  setTimeout(function () {
    loadRandomSud(4);
  }, 250);
}

// Set the onclick method for choosing new level
function setLevelFun() {
  const ulEl = getAssertedButton("lvl_list");
  const kids = ulEl.childNodes;
  let ct = 0;
  for (let k = 0; k < kids.length; ++k) {
    const innHtml = (kids[k] as HTMLElement).innerHTML;
    if (innHtml) {
      const n = parseInt(innHtml.split(" ")[1]);
      kids[k].addEventListener("click", () => loadRandomSud(n));
      ++ct;
    }
  }
}

function startHyp(e: Event) {
  hypothesis1();
  e.stopPropagation();
}

// Sets functionality to the buttons
function setButtons() {
  // Up button
  const upBut = getAssertedButton("up-but");
  upBut.style.color = col1;
  upBut.style.borderColor = col1;
  upBut.addEventListener("click", enlarge);

  // Down button
  enableSmallDigs();

  // Restart button
  function restAndClose(e: Event) {
    restart();
    ($("#restart") as any).popup("close");
    e.stopPropagation();
  }
  getAssertedButton("restart_but").addEventListener("click", restAndClose);

  // Autofill button
  getAssertedButton("auto-fill-button").addEventListener(
    "click",
    fillSmallDigits
  );

  // Custom sudoku import
  getAssertedButton("own_sud").addEventListener("click", inputCustomSudoku);

  // Hypothesis
  enableHyp();
  disableHypRejection();
  getAssertedButton("but3").addEventListener("click", endHyp);

  getAssertedButton("digits").style.display = "none";
  getAssertedButton("digits").style.display = "inline-block";
  getAssertedButton("buttons1").style.display = "none";

  // Select levels
  setLevelFun();

  // Solver
  function solveAndClose() {
    solve();
    ($("#help") as any).popup("close");
  }
  getAssertedButton("solve").addEventListener("click", solveAndClose);

  // Check
  function checkAndClose() {
    check();
    ($("#help") as any).popup("close");
  }
  getAssertedButton("check").addEventListener("click", checkAndClose);
}

function disableHyp() {
  const butt1 = getAssertedButton("but1");
  butt1.onclick = null;
  butt1.style.color = "#B8B8B8";
}
function enableHyp() {
  const butt1 = getAssertedButton("but1");
  butt1.onclick = startHyp;
  butt1.style.color = "#000";
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
  removeRed = false
) {
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
      if (removeRed) {
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
    getAssertedButton("but1").style.color = "#F00";
    choosingHyp = true;
    log(`Started choosing, curX = ${curX}`);
    if (curX >= 0) {
      clickCell(Tref[curY][curX]);
    }
  } else {
    // Cancel choosing a hypothesis digit
    finishedHypChoosing();
  }
}

function endHyp(e: Event) {
  if (hypRejectionEnabled) {
    hypothesis3();
  }
  e.stopPropagation();
}

// Revert to previous hypothesis
function hypothesis3() {
  const nHyps = hyps.length;
  if (nHyps < 1) return;
  const lastHyp = hyps[nHyps - 1];
  log(`N hyps: ${nHyps}`);
  const markCopy = deepCopy2D(Marked);

  // Set fixed digits
  if (nHyps < 2) {
    copyTo2d(Tinit, T);
    updateGrid();
    setClickableTrefT();
  } else {
    copyTo2d(hyps[nHyps - 2][1], T);
    updateGrid();
    setClickableTrefT();
    // TODO: Prev. Hyp
    const y = hyps[nHyps - 2][0][0];
    const x = hyps[nHyps - 2][0][1];
    Tref[y][x].style.color = hypCol;
    Tref[y][x].setAttribute("clickable", "0");
  }
  // Current uncertain digits
  copyTo2d(lastHyp[1], T);
  TsubBinaryTables = lastHyp[2];
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (T[i][j] > 0) {
        const m = markCopy[i][j];
        setCell(i, j, T[i][j], true, false);
        if (Tref[i][j].getAttribute("clickable") == "1") {
          Tref[i][j].style.color = col1;
          if (m > 0) {
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
    if (markCopy[y][x]) {
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
  getAssertedButton("but1").style.color = "";
  choosingHyp = false;
}

// Enable / disable the hypothesis rejection button
function enableHypRejection() {
  const rejBut = getAssertedButton("but3");
  rejBut.style.color = "#000";
  hypRejectionEnabled = true;
}
function disableHypRejection() {
  const rejBut = getAssertedButton("but3");
  rejBut.style.color = "#B8B8B8";
  hypRejectionEnabled = false;
}

// Checks if any input digits are wrong and sets their background to
// red.
function check() {
  if (solAvailable == false) return;
  console.log("Checking Sudoku: ");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
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
  let vidSrc = "./gifs/gj.mp4";
  let title = "You solved it!! :)";
  if (sudLvl == -2) {
    vidSrc = "./gifs/uncivilized.mp4";
    title = "You used the solver :(";
  } else if (sudLvl == -1) {
    vidSrc = "./gifs/thumbs_up.mp4";
    title = "You solved your own sudoku.";
  } else if (sudLvl == 0) {
    vidSrc = "./gifs/yoda_fear.mp4";
    title = "Do not fear the harder ones.";
  } else if (sudLvl < 5) {
    vidSrc = "./gifs/good.mp4";
    title = "Now try another one.";
  } else if (sudLvl == 8) {
    vidSrc = "./gifs/unlim_power.mp4";
    title = "Nothing you can't solve.";
  }
  (htmlButtonDict.get("fin-vid") as HTMLVideoElement).src = vidSrc;
  (htmlButtonDict.get("solved-h") as HTMLVideoElement).src = title;
  ($("#win") as any).popup("open");
  console.log(sudLvl);
}

// Executed when cell is clicked
function clickCell(cell: HTMLTableCellElement) {
  unhighlightAll();
  const c = Number(cell.getAttribute("clickable"));
  const y = Number(cell.getAttribute("y"));
  const x = Number(cell.getAttribute("x"));
  const numSet = T[y][x] > 0;
  if (numSet) {
    // If number in cell is set
    highlight(y, x);
  } else {
    if (Marked[y][x] == 0) {
      Tref[y][x].style.backgroundColor = normH;
    }
  }
  curY = y;
  curX = x;
  const clickable = c == 1;
  if (clickable) {
    // If Cell is clickable
    $("#digits").off("click", "**");
    // Enable all digits that are admissible
    const allowedArray = allowed(T, y, x, clickable);
    const d = new Array(10).fill(false);
    for (let i = 0; i < allowedArray.length; i++) d[allowedArray[i]] = true;
    if (numSet) {
      // Set the currently set number button to clickable
      d[T[y][x]] = true;
    }
    d[0] = true;
    for (let i = 0; i < 10; i++) {
      if (d[i]) {
        const v = i;
        digits[i].style.color = col1;
        digits[i].style.borderColor = col1;
        if (!choosingHyp || v == 0) {
          $("#digits").on("click", "#digit-" + String(i), function (e) {
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
            } else if (large) {
              unhighlightAll();
              highlight(y, x);
            }
            checkSolvedSud();
            e.stopPropagation();
          });
        } else {
          $("#digits").on("click", "#digit-" + String(i), function (e) {
            // Save current version
            if (!choosingHyp) {
              e.stopPropagation();
              return;
            }
            log("Saving current state");
            const tCopy = deepCopy2D(T);
            const tSubBinaryTablesCopy = deepCopy3D(TsubBinaryTables);
            const hypTuple = [[y, x], tCopy, tSubBinaryTablesCopy];
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
        $("#digits").on("click", "#digit-" + String(i), function (e) {
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
      $("#digits").on("click", "#digit-" + String(i), function (e) {
        log("Neet to select a cell first.");
        e.stopPropagation();
      });
    }
  }
}

function setIfNotMarked(y: number, x: number) {
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
    setIfNotMarked(y, i);
    setIfNotMarked(i, x);
    setIfNotMarked(yFloor + (i % 3), xFloor + Math.floor(i / 3));
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
function updateGrid(removeMarks = true) {
  log("Updating grid...");
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const currVal = T[i][j];
      const currMark = Marked[i][j];
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
function setSudFromStr(retSud: string) {
  ($("#newGrid") as any).popup("close");
  ($("#waiting") as any).popup("open");

  const sudAndSolStr = retSud.substr(13, 324);
  const sStr = sudAndSolStr.substr(0, 162);
  const sSolStr = sudAndSolStr.substr(162, 162);
  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const totIndT2 = 2 * (i * 9 + j);
      T[i][j] = parseInt(sStr.substr(totIndT2, 2));
      Tsol[i][j] = parseInt(sSolStr.substr(totIndT2, 2));
    }
  }

  // Shuffle
  permuteSuds(T, Tsol);
  copyTo2d(T, Tinit);
  if (!solAvailable) solAvailable = true;
  updateGrid();
  setClickableTrefT();
  clearHyps();
  ($("#waiting") as any).popup("close");
}

// Disables down button
function disableSmallDigs() {
  log("Disabled down button");
  enlarge();
  const downBut = getAssertedButton("down-but");
  downBut.onclick = null;
  downBut.style.color = "#B8B8B8";
  downBut.style.borderColor = "#B8B8B8";
  downBut.style.cursor = "pointer";
}
// Enables down button
function enableSmallDigs() {
  const downBut = getAssertedButton("down-but");
  downBut.onclick = shrink;
  downBut.style.color = "";
  downBut.style.borderColor = "";
}

// Lets the user input a custom sudoku
function inputCustomSudoku() {
  if (!inputtingOwnSud) {
    log("Own Input");
    clearHyps();
    disableHyp();

    // Toggle State and Button color
    inputtingOwnSud = true;
    solAvailable = false;
    const ownBut = getAssertedButton("own_sud");
    ownBut.style.color = "#F00";

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
    enableHyp();
    sudLvl = -1;

    // Toggle State
    inputtingOwnSud = false;
    const ownBut = getAssertedButton("own_sud");
    ownBut.style.color = "";

    // Activate small numbers and set set numbers to unclickable
    copyTo2d(T, Tinit);
    setClickableTrefT();
    enableSmallDigs();
  }
}

// Reads a random sudoku from the file and loads it.
function loadRandomSud(lvl = 7) {
  if (inputtingOwnSud) {
    inputCustomSudoku();
  }
  readSudokuFromFile(setSudFromStr, lvl);
  log(`Loaded sudoku with level ${lvl}`);
}

// Setup hypothesis buttons
function setHypButtons() {
  getAssertedButton("but1").style.color = "#000";
  getAssertedButton("but3").style.color = "#B8B8B8";
}

// Sets the current sudoku to the solution.
function solve() {
  if (solAvailable == false) return;
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
  clearHyps();
  setHypButtons();
}

function clearHyps() {
  log("Clearing hypotheses");
  hyps = [];
  choosingHyp = false;
  disableHypRejection();
}

// Restart
function restart() {
  if (inputtingOwnSud) {
    inputCustomSudoku();
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
  clearHyps();
  setHypButtons();
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
  initGrid,
  htmlButtonDict,
  col1,
  digits,
  loadRandomSud,
  setButtons,
  log,
  elsewhere,
  clickCell,
};
