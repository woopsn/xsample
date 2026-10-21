---
title: Logistic Map
---
r = param("r", linspace(2, 4, 1600), 3.55);
n = floor(param("n", 1:100, 30))

f = @(x) r*x.*(1-x);

I = linspace(0, 1, 4000);
figure(1, "name", "Orbits")
scatter(I, iterate(f, n, I), I, I)
ylim([0 1])

figure(2, "name", "Detail")
scatter(I, iterate(f, n, I), I, I)
xlim([0.45 0.55])
ylim([0.3 0.6])
