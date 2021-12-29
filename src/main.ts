// This is the main TypeScript file, it imports all necessary funtions and
// variables from `html_utils`.
//
// TODO:
// - Change Cursor when hovering over digit buttons to hand or something
// - Unit-test html_utils.ts
// - Unit-test main.ts
// - Test installation from scratch (e.g. without node.js installed)
// - Better sub-cell placement for pencil mark

// Import sudoku module
import {
  initGrid,
  setButtons,
  htmlButtonDict,
  digits,
  log,
  elsewhere,
  clickCell,
} from "./html_util";

// State Variables
var initialized = false;

const getDocEl = (id: string) => {
  const res = document.getElementById(id);
  if (res === undefined || res === null) {
    throw new Error("Undefined!");
  }
  return res;
};

// Initializing function
export function init() {
  // Abort if already called
  if (initialized) {
    return;
  } else {
    initialized = true;
  }
  window.addEventListener("load", init); // This is useless?
  document.querySelector("body")!.addEventListener("click", elsewhere);

  // Set button map
  const butIds = [
    "down-but",
    "up-but",
    "restart_but",
    "auto-fill-button",
    "but1",
    "but3",
    "own_sud",
    "digits",
    "buttons1",
    "lvl_list",
    "solve",
    "check",
    "fin-vid",
    "solved-h",
  ];
  for (const bId of butIds) {
    htmlButtonDict.set(bId, getDocEl(bId));
  }
  setButtons();

  // Set digits
  for (let i = 0; i < 10; i++) digits[i] = getDocEl("digit-" + String(i));

  // Initialize grid
  const tbl = getDocEl("grid") as HTMLTableElement;
  initGrid(tbl);
  log("Initialized grid!");

  // click on cells
  $("#grid").on("click", ".gridCell", function (e) {
    clickCell(this);
    e.stopPropagation();
  });

  // Buttons
  const i = $("#digits").height()!;
  const j = $("#buttons1").height()!;
  const diff = Math.floor((i - j) / 2) + 4;
  $("#buttons1").height(i - j);
  $("#buttons1").css("margin-top", String(diff) + "px");
  const j_html = getDocEl("buttons1").style.height;
  log(j_html);
  log("Setup buttons!");
}

// Initialize
init();
