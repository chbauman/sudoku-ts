# Sudoku-ts

A game of sudoku written in TypeScript as a mobile app.
Let's you solve the hardest sudokus by hand with depth-first search.
It allows you to guess a number and continue solving while being able to 
return to the point of guessing. This process can be done in a nested way.

![](https://chbauman.github.io/assets/img/posts/screen_sudoku_broad.png)

Try it at https://chbauman.github.io/sudoku-ts/, a screenshot is shown above.

Can you solve this one? It was [devised by Arto Inkala, a Finnish mathematician, 
and is specifically designed to be unsolvable to all but the sharpest minds.]
(https://www.telegraph.co.uk/news/science/science-news/9359579/Worlds-hardest-sudoku-can-you-crack-it.html)

<img src="https://secure.i.telegraph.co.uk/multimedia/archive/02260/Untitled-1_2260717b.jpg" alt="alt text" width="250px">

Built upon simpler JavaScript version found at https://github.com/baruchel/sudoku-js

## Installation

For local development and testing, `Node.js` was used with `jest` as a
testing framework. For installation run:

```
$ npm install --save-dev jest babel-jest babel-preset-env
$ npm i @types/jquery
```

## Development

To test the website locally, one possibility is to 
use `http-server` with `node.js`. You will probably also want 
to compile the TypeScript code:

```
$ tsc
$ http-server
```

And then go to `http://localhost:8080/index.html`.
This might change if the port is already in use.