// Import sudoku module
import {
  init_grid,
  set_buttons,
  html_button_dict,
  digits,
  log,
  elsewhere,
  clickCell
} from "./html_util.js";

// TODO:
// - Change Cursor when hovering over digit buttons to hand or something
// - Reorder bottom buttons
// - Unit-test html_utils.ts
// - Unit-test main.ts
// - Test and document installation for development

// State Variables
var initialized = false;

// Initializing function
function init() {
  // Abort if already called
  if (initialized) {
    return;
  } else {
    initialized = true;
  }
  window.addEventListener("load", init); // This is useless?
  document.querySelector("body").addEventListener("click", elsewhere);

  // Set button map
  let but_ids = [
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
    "solved-h"
  ];
  for (let b_id of but_ids) {
    html_button_dict.set(b_id, document.getElementById(b_id));
  }
  set_buttons();

  // Set digits
  for (let i = 0; i < 10; i++)
    digits[i] = document.getElementById("digit-" + String(i));

  // Initialize grid
  let tbl = document.getElementById("grid") as HTMLTableElement;
  init_grid(tbl);
  log("Initialized grid!");

  // click on cells
  $("#grid").on("click", ".gridCell", function(e) {
    clickCell(this);
    e.stopPropagation();
  });

  // Buttons
  const i = $("#digits").height();
  const j = $("#buttons1").height();
  const diff = Math.floor((i - j) / 2) + 4;
  $("#buttons1").height(i - j);
  $("#buttons1").css("margin-top", String(diff) + "px");
  const j_html = document.getElementById("buttons1").style.height;
  log(j_html);
  log("Setup buttons!");
}

// Initialize
init();

// Export for testing
export { init };
