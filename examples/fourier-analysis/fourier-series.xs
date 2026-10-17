---
title: Fourier Series
---
n = param("n", colon(1, 500), 8)
x = linspace(-pi, pi, 1800)

dkn = sin((n+1/2)*x) ./ sin(x/2);

w = param("w", linspace(0.1, 0.5, 100))
s = (abs(x+2) < w) - (abs(x+1) < w) + (abs(x) < w) + (abs(x-1) < w) - (abs(x-2) < w)

y = conv(dkn, s) / length(x)
x2 = linspace(2*x(0), 2*x(length(x)-1), length(y))

plot(0, x, s, x2, y)

xlim(0, [-3 3]); ylim(0, [-2 2])
