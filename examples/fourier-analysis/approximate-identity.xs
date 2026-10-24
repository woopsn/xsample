---
title: Approximate Identity
---
n = param("n", 1:30, 8, "Highest harmonic of the kernel")
w = param("w", linspace(0, 1), 0.3, "Half-width of each pulse")
x = linspace(-pi, pi, 8*n)

e = fold(0:n, x*0, @(s, n) s+cos(n*x))

s = (abs(x+2) < w) - (abs(x+1) < w) + (abs(x) < w) + (abs(x-1) < w) - (abs(x-2) < w)
se = conv(s, e) / (length(x)/2)

x2 = linspace(-2*pi, 2*pi, length(se))

figure(1); title("Kernel")
plot(x, e)
xlabel("x")

figure(2); title("Convolution")
plot(x, s, x2, se)
xlabel("x"); legend("pulses", "convolution")
