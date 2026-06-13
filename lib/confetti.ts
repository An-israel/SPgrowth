import confetti from "canvas-confetti";

export function fireConfetti(intense = false) {
  const count = intense ? 220 : 120;
  const defaults = { origin: { y: 0.6 }, zIndex: 9999 };

  function burst(particleRatio: number, opts: confetti.Options) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
      colors: ["#E8B548", "#5B4BDB", "#22C55E", "#4338CA", "#f0d175"],
    });
  }

  burst(0.25, { spread: 26, startVelocity: 55 });
  burst(0.2, { spread: 60 });
  burst(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  burst(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  burst(0.1, { spread: 120, startVelocity: 45 });

  if (intense) {
    setTimeout(() => burst(0.3, { spread: 100, startVelocity: 45 }), 250);
    setTimeout(() => burst(0.3, { spread: 120, startVelocity: 35 }), 500);
  }
}
