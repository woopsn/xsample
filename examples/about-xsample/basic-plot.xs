---
title: Basic Plot w/ Parameters
---
sigma = param("sigma", linspace(0.1, 5), 1)
phint("sigma", "Standard deviation")

x = linspace(-10, 10)
plot(x, exp(-x.^2 / (2*sigma^2)) / (sigma*sqrt(2*pi)))
ylim([0 1])
