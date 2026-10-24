---
title: Fourier Series
---
n = param("n", 1:500, 8, "Number of harmonics")
x = linspace(-pi, pi, 1800)

dkn = sin((n+1/2)*x) ./ sin(x/2);

w = param("w", linspace(0.1, 0.5, 100), "Half-width of each pulse")
s = (abs(x+2) < w) - (abs(x+1) < w) + (abs(x) < w) + (abs(x-1) < w) - (abs(x-2) < w)

y = conv(dkn, s) / length(x)
x2 = linspace(2*x(0), 2*x(length(x)-1), length(y))

plot(x, s, x2, y)
  xlim([-3 3]); ylim([-2 2])
  xlabel("x"); legend("pulses", "partial sum")
