import { initGrid, setButtons, htmlButtonDict, digits, log, elsewhere, clickCell, } from "./html_util.js";
let initialized = false;
const getDocEl = (id) => {
    const res = document.getElementById(id);
    if (res === undefined || res === null) {
        throw new Error("Undefined!");
    }
    return res;
};
export function init() {
    if (initialized) {
        return;
    }
    else {
        initialized = true;
    }
    document.querySelector("body").addEventListener("click", (e) => {
        const target = e.target;
        if (!target.closest("dialog, [data-open], #auto-fill-button, #own_sud")) {
            elsewhere();
        }
    });
    const butIds = [
        "mode-but",
        "undo-but",
        "confirm-title",
        "confirm-desc",
        "confirm-yes",
        "confirm-cancel",
        "restart_but",
        "auto-fill-button",
        "but1",
        "but3",
        "own_sud",
        "digits",
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
    for (let i = 0; i < 10; i++)
        digits[i] = getDocEl("digit-" + String(i));
    const tbl = getDocEl("grid");
    initGrid(tbl);
    log("Initialized grid!");
    tbl.addEventListener("click", (e) => {
        const cell = e.target.closest(".gridCell");
        if (cell) {
            clickCell(cell);
            e.stopPropagation();
        }
    });
    log("Setup buttons!");
}
init();
//# sourceMappingURL=main.js.map