# Hard Sudoku (sudoku-ts)

Hard Sudoku is a game of sudoku written in TypeScript as a mobile app.
Let's you solve the hardest sudokus by hand with depth-first search.
It allows you to guess a number and continue solving while being able to
return to the point of guessing. This process can be done in a nested way.
Try it at [chrisbaumann.ch/sudoku-ts](https://chrisbaumann.ch/sudoku-ts/), a screenshot is shown below.

![](https://chbauman.github.io/assets/img/posts/screen_sudoku_broad.png)

More instructions can be found in a blog post [here.](https://chbauman.github.io/info/2020/03/25/sudoku-ts/)
Can you solve the one below? It was [devised by Arto Inkala, a Finnish mathematician,
and is specifically designed to be unsolvable to all but the sharpest minds.](https://www.telegraph.co.uk/news/science/science-news/9359579/Worlds-hardest-sudoku-can-you-crack-it.html)

<img src="https://secure.i.telegraph.co.uk/multimedia/archive/02260/Untitled-1_2260717b.jpg" alt="alt text" width="300px">

## Implementation

Built upon simpler JavaScript version found at https://github.com/baruchel/sudoku-js.
The icons are open source (Ionicons, MIT) and taken from https://ionicons.com/; they are inlined in `src/index.html`.

## Menu, pages and settings

The hamburger menu in the header opens the Help, Settings and History pages. The pages are sections of the single
`index.html`, selected by the URL hash (`#help`, `#settings`), so the browser and
Android back buttons work and the game state is kept while a page is open.
Settings (stored like the saved game, see `src/settings.ts`): the level that is
loaded when there is no saved game, and the appearance (system / light / dark).

## History (personal leaderboard)

The time to solve a sudoku (only the time the game page is visible, restarting
the sudoku restarts the clock) and the puzzle ID (`<level>-<line in the level
file>`) are stored when you finish a sudoku without the solver; custom sudokus
are not recorded. The History page shows the best and average time per level
and the 20 most recent solves, the win dialog shows the time and whether it is a
new best. The data stays on the device (same storage as the saved game, see
below), there is no server; the last 500 solves are kept.

## Saved game

The current game (digits, pencil marks and hypotheses) is stored in the
browser's `localStorage` (in the Android app additionally in the native
Preferences, see `src/storage.ts`: the WebView writes `localStorage` to disk
lazily, so a game could be lost when the app was swiped away right after a
move) after every move, so reloading the page (easily done
by accident on mobile) continues where you left off. Solving a sudoku, loading
a new one or clearing the site data starts a fresh game. The undo history is
not saved.

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| Arrow keys | Move the selected cell (starts at the top left) |
| `1`-`9` | Enter the digit (or toggle the pencil mark in pencil mode) |
| `Delete` / `Backspace` / `0` | Clear the selected cell |
| `Ctrl`/`Cmd` + `Z` | Undo (digits, pencil marks, autofill, hypothesis rejection) |

## Development

Requires `Node.js`. Everything is run through npm:

```
$ npm install     # install dependencies
$ npm run build   # compile TypeScript to dist/
$ npm run watch   # recompile on changes
$ npm start       # build and serve at http://localhost:8080/src/index.html
$ npm run dev     # watch + serve
$ npm test        # run the jest tests
```

The port may differ if 8080 is already in use.
The local dev server does not register the service worker (see below).

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which runs the tests,
builds the TypeScript (`dist/` is not committed) and publishes the site to the
`gh-pages` branch (site root = `src/` contents plus `dist/` and `assets/`).
In the repository settings, set Pages to deploy from the `gh-pages` branch
(root). The page is then available at the default GitHub Pages address,
<https://chrisbaumann.ch/sudoku-ts/>. All paths are relative, so it works
under the `/sudoku-ts/` sub-path.

## Installable / offline (PWA)

The deployed page is an installable web app (`src/manifest.webmanifest`) and
works offline: `src/sw.js` is a service worker that precaches the app, the
icons and all level files. On deploy the cache name gets the commit hash, so
every release replaces the cached version. The service worker is not
registered when the page is served from `/src/` (local dev), so changes show
up immediately while developing.

## Android app

The Android app is a thin [Capacitor](https://capacitorjs.com) wrapper around
the same web app: `npm run assemble` builds the site into `_site/` (the same
step that is deployed to GitHub Pages) and `npx cap sync android` copies it
into the Android project in `android/`. There is no separate Android code to
maintain; the app works offline because all files are bundled.

The workflow `.github/workflows/android.yml` builds a debug APK on every push
to `main` and for pull requests that touch the app (Actions run -> Artifacts ->
`sudoku-debug-apk`). To install it, copy `app-debug.apk` to the phone and open
it (allow installing from unknown sources). To build locally you need Node 22,
JDK 21 and the Android SDK:

```
$ npm run assemble
$ npx cap sync android
$ cd android && ./gradlew assembleDebug   # android/app/build/outputs/apk/debug/
```

A Play Store release additionally needs a release signing key
(`./gradlew bundleRelease`); this is not set up yet.
