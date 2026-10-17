import { storageGet, storageSet } from "./storage.js";
import { MAX_LEVEL } from "./sudoku.js";
const SETTINGS_KEY = "sudoku-ts:settings:v1";
export const settings = { level: 2, theme: "auto" };
const THEME_COLORS = { light: "#ffffff", dark: "#16181d" };
export function applyTheme(theme) {
    const root = document.documentElement;
    if (theme === "auto")
        delete root.dataset.theme;
    else
        root.dataset.theme = theme;
    const metas = document.querySelectorAll('meta[name="theme-color"]');
    metas.forEach((meta) => {
        const dark = meta.media.includes("dark");
        const color = theme === "auto"
            ? THEME_COLORS[dark ? "dark" : "light"]
            : THEME_COLORS[theme];
        meta.content = color;
    });
}
let loading = null;
export function loadSettings() {
    return (loading ?? (loading = readSettings()));
}
async function readSettings() {
    try {
        const raw = await storageGet(SETTINGS_KEY);
        if (raw) {
            const s = JSON.parse(raw);
            if (Number.isInteger(s.level) && s.level >= 0 && s.level <= MAX_LEVEL) {
                settings.level = s.level;
            }
            if (["auto", "light", "dark"].includes(s.theme))
                settings.theme = s.theme;
        }
    }
    catch (e) {
    }
    applyTheme(settings.theme);
}
export function saveSettings() {
    storageSet(SETTINGS_KEY, JSON.stringify(settings));
}
//# sourceMappingURL=settings.js.map