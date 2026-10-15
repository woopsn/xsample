---
title: Fourier Transform
---
w = param(0, linspace(0.1, 20), 1)
n = param(1, colon(64, 512, 2), 256)

t = linspace(-2*pi, 2*pi, n)
y = transpose(sin(w*pi*t) ./ (w*pi*t))

ps = (dft_r(n)*y).^2 + (dft_i(n)*y).^2
ps = fftshift(transpose(ps))

Fs = 1/(t(1) - t(0))
f = linspace(-Fs/2, Fs/2, n)

plot(0, t, y)
plot(1, f, ps / max(ps))

ylim(0, [-0.3 1.3])
ylim(1, [0 1.3])
