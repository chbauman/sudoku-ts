// Assembles the deployable site (also the web content of the Android app)
// in _site/ from the compiled sources. Run `npm run build` first.
//
// src/ references its siblings as "../dist" and "../assets"; in the site,
// index.html lives next to dist/ and assets/, so those paths are rewritten.
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";

const out = "_site";
const build = (process.env.GITHUB_SHA ?? "dev").slice(0, 10);

rmSync(out, { recursive: true, force: true });
mkdirSync(out);
for (const f of ["index.html", "style.css", "manifest.webmanifest", "sw.js", "privacy.html"]) {
  cpSync(`src/${f}`, `${out}/${f}`);
}
cpSync("dist", `${out}/dist`, { recursive: true });
cpSync("assets", `${out}/assets`, { recursive: true });

const rewrite = (file, f) => writeFileSync(file, f(readFileSync(file, "utf8")));
const flatten = (s) => s.replaceAll('"../', '"./');
for (const f of ["index.html", "manifest.webmanifest"]) {
  rewrite(`${out}/${f}`, flatten);
}
for (const f of ["main", "html_util", "sudoku", "storage", "settings", "pages", "history"]) {
  rewrite(`${out}/dist/${f}.js`, flatten);
}
// New service worker cache per release
rewrite(`${out}/sw.js`, (s) => s.replaceAll("__BUILD__", build));
console.log(`Assembled ${out}/ (build ${build})`);
