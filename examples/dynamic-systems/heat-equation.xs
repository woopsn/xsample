---
title: Heat Equation
---
n = param("n", colon(0, 2000))
r = param("r", linspace(0, 0.55), 0.4)

x = linspace(-10, 10, 500)

u0 = abs(x+3) < 2
u0 += 1/2 * (abs(x) < 1/2)

step = @(u) (1-2*r)*u + r*shift(u, -1) + r*shift(u, 1)

plot(x, iterate(step, n, u0))
ylim([0 1.3])
