import { settings, loadSettings, saveSettings, applyTheme, } from "./settings.js";
const TITLES = {
    game: "Sudoku",
    help: "Help",
    settings: "Settings",
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