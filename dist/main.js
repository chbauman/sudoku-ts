import { initGrid, setButtons, htmlButtonDict, digits, log, elsewhere, clickCell, } from "./html_util.js";
var initialized = false;
var getDocEl = function (id) {
    var res = document.getElementById(id);
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
    window.addEventListener("load", init);
    document.querySelector("body").addEventListener("click", elsewhere);
    var butIds = [
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
    for (var _i = 0, butIds_1 = butIds; _i < butIds_1.length; _i++) {
        var bId = butIds_1[_i];
        htmlButtonDict.set(bId, getDocEl(bId));
    }
    setButtons();
    for (var i_1 = 0; i_1 < 10; i_1++)
        digits[i_1] = getDocEl("digit-" + String(i_1));
    var tbl = getDocEl("grid");
    initGrid(tbl);
    log("Initialized grid!");
    $("#grid").on("click", ".gridCell", function (e) {
        clickCell(this);
        e.stopPropagation();
    });
    var i = $("#digits").height();
    var j = $("#buttons1").height();
    var diff = Math.floor((i - j) / 2) + 4;
    $("#buttons1").height(i - j);
    $("#buttons1").css("margin-top", String(diff) + "px");
    var j_html = getDocEl("buttons1").style.height;
    log(j_html);
    log("Setup buttons!");
}
init();
//# sourceMappingURL=main.js.map