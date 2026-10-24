---
title: Fourier Transform
---
w = param("w", linspace(0.1, 20), 1, "Frequency of the sinc pulse")
n = param("n", 64:2:512, 256, "Number of samples")

t = linspace(-2*pi, 2*pi, n)
y = transpose(sin(w*pi*t) ./ (w*pi*t))

ps = (dft_r(n)*y).^2 + (dft_i(n)*y).^2
ps = fftshift(transpose(ps))

Fs = 1/(t(1) - t(0))
f = linspace(-Fs/2, Fs/2, n)

figure(1); title("Signal")
plot(t, y)
ylim([-0.3 1.3])
xlabel("t")

figure(2); title("Power spectrum")
plot(f, ps / max(ps))
ylim([0 1.3])
xlabel("frequency"); ylabel("normalized power")
