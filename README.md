# Sudoku-ts

A game of sudoku written in TypeScript as a mobile app.
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
The icons open source and taken from https://ionicons.com/.

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
Note that an internet connection is required to load the icons.

## Deployment

Pushes to `main` trigger `.github/workflows/deploy.yml`, which runs the tests,
builds the TypeScript (`dist/` is not committed) and publishes the site to the
`gh-pages` branch (site root = `src/` contents plus `dist/` and `assets/`).
In the repository settings, set Pages to deploy from the `gh-pages` branch
(root). The page is then available at the default GitHub Pages address,
<https://chrisbaumann.ch/sudoku-ts/>. All paths are relative, so it works
under the `/sudoku-ts/` sub-path.
