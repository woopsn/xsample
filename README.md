# xsampler

A small MATLAB-like language that runs in the browser. Scripts declare
parameters which each becomes a form control, so a figure can be explored
 by dragging a slider: how a dynamic system evolves, its dependence on
parameters, how numerical methods behaves.

```
n = param(0, colon(0, 2000))
r = param(1, linspace(0, 0.55), 0.4)

x = linspace(-10, 10, 500)
u0 = abs(x+3) < 2

step = @(u) (1-2*r)*u + r*shift(u, -1) + r*shift(u, 1)

plot(0, x, iterate(step, n, u0))
```

## Development

    yarn install
    yarn dev       # dev server
    yarn build     # production build into dist/
    yarn test      # run the tests

The parser (`src/xsampler/parser.js`) is generated from `xsampler.p` with
[Peggy](https://peggyjs.org/online.html).

## Roadmap

The project is being brought back up from a prototype:

  - Tests: cover the parser, interpreter and numeric library, pinning down
    current behaviour and known bugs before.
  - Core engine: port to TypeScript, keep decoupled from DOM/UI dependencies
  - Workspace: port to React, replace the jQuery/DOM-helper workspace
  - Charts: port to uPlot, replace Chartkick/Chart.js.
  - Demos: create github pages
  - **Extend**

### Open questions

  - How an animation loop is written: a `for` statement, or `plot` inside
    `iterate`.
  - How a superseded run is cancelled when a parameter changes mid-run.

## TODO

  - click inputs ((x,y) from chart)
  - file inputs (csv)

  - imshow
  - image inputs

  - new display, new artifact
  - display edit
    * type selection
  - radio mode for displays list
  - get rid of "artifacts", displays look directly into script
  - implement `end`
  - implement range indexing
  - implement range assignment
  - block mkmatrix
  - move script execution to web worker
  - scalar result "chart" is just large text

## UI

------------------------------------------------------------------------------
|
|
|        -----------------------------------------------------  artifacts
|        |                                                   |  ---------
|        |                                                   |    .
|        |                                                   |    .
|        |              modal                                |    .
|        |                *figures*                          |
|        |                *artifact config*                  |
|        |                                                   |
|        |                                                   |
|        |                                                   |
|        |                                                   |
|        |                                                   |
|        -----------------------------------------------------   workspace files
|        |                                                   |   ---------------
|        |              editor                               |     .
|        |                *scripts*                          |     .
|        |                *figures*                          |     .
|        |                                                   |
|        |                                                   |
|        -----------------------------------------------------
|
|
|
|

