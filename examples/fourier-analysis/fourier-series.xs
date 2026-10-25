---
title: Fourier Series
description: <p>The Fourier series of a function <tt>s</tt> is a representation of the signal as a trigonometric series. The coefficients of each harmonic term <tt>e<sup>ikx</sup></tt> can be computed one by one with some analysis, but the <tt>n<sup>th</sup></tt> partial sum can also be obtained from the convolution <tt>(1/2&pi;)s&lowast;D<sub>n</sub></tt> of the signal with the <em>Dirichlet kernel</em></p><center><tt>D<sub>n</sub>(x) = sin((n+1/2)*x)/sin(x/2)</tt></center><p>This function is the periodic equivalent of a <tt><em>sinc</em></tt> function, the convolutional representation (impulse response) of an ideal low-pass filter encompassing the frequencies <tt>k=-n</tt> through <tt>k=n</tt>.</p>
---
n = param("n", 1:500, 8, "Highest harmonic")
x = linspace(-pi, pi, 1800)

D_n = sin((n+1/2)*x) ./ sin(x/2);

w = param("w", linspace(0.1, 0.5, 100), "Half-width of each pulse")
s = (abs(x+2) < w) - (abs(x+1) < w) + (abs(x) < w) + (abs(x-1) < w) - (abs(x-2) < w)

y = conv(D_n, s) / length(x)
x2 = linspace(2*x(0), 2*x(length(x)-1), length(y))

plot(x, s, x2, y)
  xlim([-3 3]); ylim([-2 2])
  xlabel("x"); legend("signal", "partial sum")
