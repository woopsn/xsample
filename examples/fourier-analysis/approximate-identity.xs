---
title: Approximate Identity
---
n = param("n", colon(1, 30), 8)
w = param("w", linspace(0, 1), 0.3)
x = linspace(-pi, pi, 8*n)

e = fold(colon(0, n), x*0, @(s, n) s+cos(n*x))

s = (abs(x+2) < w) - (abs(x+1) < w) + (abs(x) < w) + (abs(x-1) < w) - (abs(x-2) < w)
se = conv(s, e) / (length(x)/2)

x2 = linspace(-2*pi, 2*pi, length(se))

plot(0, x, e)
plot(1, x, s, x2, se)
