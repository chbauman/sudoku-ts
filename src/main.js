import { init_grid, set_buttons, html_button_dict, digits, log, elsewhere, clickCell } from "./html_util.js";
var initialized = false;
function init() {
    if (initialized) {
        return;
    }
    else {
        initialized = true;
    }
    window.addEventListener("load", init);
    document.querySelector("body").addEventListener("click", elsewhere);
    var but_ids = [
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
    for (var _i = 0, but_ids_1 = but_ids; _i < but_ids_1.length; _i++) {
        var b_id = but_ids_1[_i];
        html_button_dict.set(b_id, document.getElementById(b_id));
    }
    set_buttons();
    for (var i_1 = 0; i_1 < 10; i_1++)
        digits[i_1] = document.getElementById("digit-" + String(i_1));
    var tbl = document.getElementById("grid");
    init_grid(tbl);
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
    var j_html = document.getElementById("buttons1").style.height;
    log(j_html);
    log("Setup buttons!");
}
init();
export { init };
//# sourceMappingURL=main.js.map