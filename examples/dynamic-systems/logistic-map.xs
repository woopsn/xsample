---
title: Logistic Map
---
r = param(0, linspace(2, 4, 1600), 3.55);
n = floor(param(1, colon(1, 100), 30))

f = @(x) r*x.*(1-x);

I = linspace(0, 1, 4000);
scatter(0, I, iterate(f, n, I), I, I)
scatter(1, I, iterate(f, n, I), I, I)

ylim(0, [0 1])
xlim(1, [0.45 0.55])
ylim(1, [0.3 0.6])
