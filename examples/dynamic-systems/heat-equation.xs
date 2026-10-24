---
title: Heat - 1D (Explicit)
description: <p>Explicit methods compute the changes to a system directly from its state at the previous step, for instance by a finite difference approximation of its dynamics.</p><p>While this can be very efficient (each update is an arithmetic expression with just a few terms evaluated at the adjacent grid points), explicit methods become unstable unless the time step is kept small compared to diffusion across the grid. Specifically, the diffusion number <tt>r=&alpha;&Delta;t/&Delta;x<sup>2</sup></tt> must be at most 1/2.</p>
---
n = param("n", 0:2000)
phint("n", "Number of time steps")
r = param("r", linspace(0, 0.55), 0.4)
phint("r", "Diffusion number")

x = linspace(-10, 10, 500)

u0 = abs(x+3) < 2
u0 += 1/2 * (abs(x) < 1/2)

step = @(u) (1-2*r)*u + r*shift(u, -1) + r*shift(u, 1)

plot(x, iterate(step, n, u0))
ylim([0 1.3])
