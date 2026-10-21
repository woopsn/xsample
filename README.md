# xsample

A small MATLAB-like language that runs in the browser. Scripts declare
parameters which each becomes a form control, so a figure can be explored
 by dragging a slider: how a dynamic system evolves, its dependence on
parameters, how numerical methods behaves.

```
n = param("n", 0:2000)
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
