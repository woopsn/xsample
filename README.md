# xsample

A small MATLAB-like language that runs in the browser. Scripts declare
parameters which each becomes a form control, so a figure can be explored
 by dragging a slider: how a dynamic system evolves, its dependence on
parameters, how numerical methods behaves.

```
n = param("n", colon(0, 2000))
r = param("r", linspace(0, 0.55), 0.4)

x = linspace(-10, 10, 500)
u0 = abs(x+3) < 2

step = @(u) (1-2*r)*u + r*shift(u, -1) + r*shift(u, 1)

plot(x, iterate(step, n, u0))
```

## Development

    yarn install
    yarn dev       # dev server
    yarn build     # production build into dist/
    yarn test      # run the tests
    yarn typecheck # check the types
    yarn format    # format with Prettier

The parser is compiled from the grammar in `xsampler.p` with
[Peggy](https://peggyjs.org), by a Vite plugin in `vite.config.js`.

## Roadmap

The project is being brought back up from a prototype:

  - Demos: create github pages
  - Errors: report a script's runtime errors in the workspace; today the
    worker stops without posting `done`, and the page shows nothing
  - **Extend**

### Open questions

  - How an animation loop is written: a `for` statement, or `plot` inside
    `iterate`.

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
  - scalar result "chart" is just large text

## UI

```
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
```
