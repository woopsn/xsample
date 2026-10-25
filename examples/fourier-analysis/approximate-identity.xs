---
title: Approximate Identities
description: <p>True function spaces have no identity element with respect to convolution &mdash; the Dirac delta "function" with <tt>&delta;&lowast;s = s</tt> does not exist as such.</p><p>Instead these spaces may be equipped with a family of functions <tt>e<sub>n</sub></tt> that <em>approximate</em> an identity element, in the sense that <tt>s&lowast;e<sub>n</sub></tt> approaches <tt>s</tt> when <tt>n &rarr; &infin;</tt>. Such a family need not be unique.</p><p>While many functions can be approximated by convolution with the Dirichlet kernel (see <a href="#fourier-analysis/fourier-series">Fourier Series</a>), the family is not an approximate identity. The Gibbs "ringing" phenomenon, for example, distorts each jump discontinuity by about 9% no matter how many harmonics are considered. Since the Dirichlet kernel takes negative values around the main lobe, it samples the jump for some period in the opposite direction.</p><p>The Fejér kernel is an average of Dirichlet kernels which is always non-negative, and it does approximate a convolutional identity element &mdash; <tt>s</tt> is reproduced, in the limit, by the <em>averages</em> of its Fourier partial sums even where the sums themselves fail to converge.</p>
---
n = param("n", 1:128, 30, "Highest harmonic of the kernel")
w = param("w", linspace(0, 1), 0.3, "Half-width of each pulse")
x = linspace(-pi, pi, 64*n)

% Dirichlet kernel: 1 + 2 sum_k cos(kx)
d = fold(1:n, x*0 + 1, @(s, k) s + 2*cos(k*x))

% Fejér kernel: 1 + 2 sum_k (1 - k/(n+1)) cos(kx)
% (the mean of the first n+1 Dirichlet kernels)
f = fold(1:n, x*0 + 1, @(s, k) s + 2*(1 - k/(n+1))*cos(k*x))

s = (abs(x+2) < w) - (abs(x+1) < w) + (abs(x) < w) + (abs(x-1) < w) - (abs(x-2) < w)
sd = conv(s, d) / length(x)
sf = conv(s, f) / length(x)

x2 = linspace(-2*pi, 2*pi, length(sd))

figure(1)
  title("Kernels")
  plot(x, d, x, f)
  xlabel("x")
  legend("Dirichlet", "Fejér")

figure(2)
  title("Convolutions")
  plot(x2, sd, x2, sf, x, s)
  xlabel("x")
  legend("Dirichlet", "Fejér", "pulses")
