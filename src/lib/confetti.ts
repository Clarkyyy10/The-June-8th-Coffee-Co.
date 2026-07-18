import confetti from "canvas-confetti";

const COFFEE_COLORS = ["#c8955c", "#a9743d", "#5b3a21", "#e6d5be", "#3b2416"];

/** Celebrate a sales milestone with a warm coffee-toned confetti burst. */
export function celebrate() {
  // Respect reduced-motion preferences.
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const end = Date.now() + 900;
  const frame = () => {
    confetti({
      particleCount: 4,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors: COFFEE_COLORS,
      scalar: 0.9,
    });
    confetti({
      particleCount: 4,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors: COFFEE_COLORS,
      scalar: 0.9,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();

  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.6 },
    colors: COFFEE_COLORS,
  });
}
