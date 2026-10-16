import { loadHistory, bestTime, formatTime } from "./history.js";
import { settings, loadSettings, saveSettings, applyTheme, } from "./settings.js";
const TITLES = {
    game: "Hard Sudoku",
    help: "Help",
    settings: "Settings",
    history: "History",
};
const byId = (id) => document.getElementById(id);
export function currentPage() {
    const page = location.hash.slice(1);
    return page in TITLES ? page : "game";
}
function showPage() {
    const page = currentPage();
    document.querySelectorAll("[data-page]").forEach((el) => {
        el.hidden = el.dataset.page !== page;
    });
    byId("page-title").textContent = TITLES[page];
    byId("back-btn").hidden = page === "game";
    closeMenu();
    window.scrollTo(0, 0);
    if (page === "history")
        renderHistory();
}
async function renderHistory() {
    const entries = await loadHistory();
    byId("history-empty").hidden = entries.length > 0;
    byId("history-content").hidden = entries.length === 0;
    const row = (cells, tag = "td") => "<tr>" +
        cells
            .map((c, i) => `<${tag}${i > 0 ? ' class="num"' : ""}>${c}</${tag}>`)
            .join("") +
        "</tr>";
    const levels = [...new Set(entries.map((e) => e.level))].sort((a, b) => a - b);
    byId("history-levels").innerHTML =
        row(["Level", "Solved", "Best", "Average"], "th") +
            levels
                .map((level) => {
                const times = entries.filter((e) => e.level === level).map((e) => e.seconds);
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                return row([
                    `Lvl ${level}`,
                    String(times.length),
                    formatTime(bestTime(entries, level)),
                    formatTime(avg),
                ]);
            })
                .join("");
    const recent = entries.slice(-20).reverse();
    byId("history-recent").innerHTML =
        row(["Date", "Level", "Time", "ID"], "th") +
            recent
                .map((e) => row([
                new Date(e.date).toLocaleDateString(),
                `Lvl ${e.level}`,
                formatTime(e.seconds),
                `#${e.id.split("-")[1]}`,
            ]))
                .join("");
}
function closeMenu() {
    byId("menu").hidden = true;
    byId("menu-btn").setAttribute("aria-expanded", "false");
}
function toggleMenu() {
    const menu = byId("menu");
    menu.hidden = !menu.hidden;
    byId("menu-btn").setAttribute("aria-expanded", String(!menu.hidden));
}
function setupSettings() {
    const level = byId("setting-level");
    const theme = byId("setting-theme");
    loadSettings().then(() => {
        level.value = String(settings.level);
        theme.value = settings.theme;
    });
    level.addEventListener("change", () => {
        settings.level = Number(level.value);
        saveSettings();
    });
    theme.addEventListener("change", () => {
        settings.theme = theme.value;
        applyTheme(settings.theme);
        saveSettings();
    });
}
function keyboardLikely() {
    return (matchMedia("(hover: hover) and (pointer: fine)").matches ||
        navigator.maxTouchPoints === 0);
}
export function setupPages() {
    byId("keyboard-help").hidden = !keyboardLikely();
    let prev = currentPage();
    let cameFromGame = false;
    window.addEventListener("hashchange", () => {
        const page = currentPage();
        if (page === "game")
            cameFromGame = false;
        else if (prev === "game")
            cameFromGame = true;
        prev = page;
        showPage();
    });
    byId("back-btn").addEventListener("click", () => {
        if (cameFromGame)
            history.back();
        else
            location.hash = "";
    });
    byId("menu").addEventListener("click", (e) => {
        const link = e.target.closest("a");
        if (link && currentPage() !== "game") {
            e.preventDefault();
            location.replace(link.getAttribute("href"));
        }
    });
    byId("menu-btn").addEventListener("click", toggleMenu);
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#menu-btn"))
            closeMenu();
    });
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape")
            closeMenu();
    });
    setupSettings();
    showPage();
}
//# sourceMappingURL=pages.js.map