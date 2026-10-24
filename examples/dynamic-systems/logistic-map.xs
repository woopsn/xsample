---
title: Logistic Map
description: <p>The logistic map is a quadratic iterative model of population dynamics with a normalized carrying capacity, and growth rate parameter <tt>r</tt>.</p><p>When the growth rate is moderate (<tt>1 &lt; r &lt; 3</tt>), the population approaches a stable equilibrium at <tt>1-1/r</tt>. As the growth rate increases past <tt>r=3</tt>, the population experiences a period-doubling bifurcation and the dynamics lead it to alternate between two values on either side of the old equilibrium. These bifurcations recur with increasing <tt>r</tt> leading to a cascade and eventual chaos at <tt>r&asymp;3.57</tt>.</p>
---
r = param("r", linspace(2, 4, 1600), 3.55, "Normalized growth rate");
n = floor(param("n", 1:100, 30, "Number of iterations"))

f = @(x) r*x.*(1-x);

I = linspace(0, 1, 4000);
figure(1);
  title("Orbits"); ylim([0 1])
  scatter(I, iterate(f, n, I), I, I)
  xlabel("initial population")
  legend("population after n steps", "y = x")

figure(2);
  title("Detail"); ylim([0.3 0.6])
  scatter(I, iterate(f, n, I), I, I)
  xlabel("initial population");
  legend("population after n steps", "y = x")
