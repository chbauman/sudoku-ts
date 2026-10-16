// Page navigation: the game, help and settings are "pages" of the single
// index.html, selected by the URL hash (#help, #settings). The hamburger menu
// in the header opens the other pages, the back button (and the Android back
// button) return to the game.
import {
  settings,
  loadSettings,
  saveSettings,
  applyTheme,
  Theme,
} from "./settings.js";

const TITLES: { [page: string]: string } = {
  game: "Sudoku",
  help: "Help",
  settings: "Settings",
};

const byId = <T extends HTMLElement>(id: string) =>
  document.getElementById(id) as T;

/** Page named by the current hash, "game" for none or unknown ones */
export function currentPage(): string {
  const page = location.hash.slice(1);
  return page in TITLES ? page : "game";
}

/** Goes back to the game page */
export function goHome() {
  if (currentPage() !== "game") location.hash = "";
}

function showPage() {
  const page = currentPage();
  document.querySelectorAll<HTMLElement>("[data-page]").forEach((el) => {
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
  const level = byId<HTMLSelectElement>("setting-level");
  const theme = byId<HTMLSelectElement>("setting-theme");
  loadSettings().then(() => {
    level.value = String(settings.level);
    theme.value = settings.theme;
  });
  level.addEventListener("change", () => {
    settings.level = Number(level.value);
    saveSettings();
  });
  theme.addEventListener("change", () => {
    settings.theme = theme.value as Theme;
    applyTheme(settings.theme);
    saveSettings();
  });
}

export function setupPages() {
  // Back: undo the navigation if it came from within the app, so that the
  // browser / Android back button and this button behave the same
  let navigated = false;
  window.addEventListener("hashchange", () => {
    navigated = true;
    showPage();
  });
  byId("back-btn").addEventListener("click", () => {
    if (navigated) history.back();
    else location.hash = "";
  });

  byId("menu-btn").addEventListener("click", toggleMenu);
  // Clicking an entry navigates via its link; anywhere else closes the menu
  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest("#menu-btn")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  setupSettings();
  showPage();
}
