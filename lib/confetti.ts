import confetti from "canvas-confetti";

export function fireUpvoteConfetti(event?: React.MouseEvent<Element> | HTMLElement) {
  if (typeof window === "undefined") return;

  let x = 0.5;
  let y = 0.5;

  if (event && "clientX" in event) {
    x = event.clientX / window.innerWidth;
    y = event.clientY / window.innerHeight;
  } else if (event && event instanceof HTMLElement) {
    const rect = event.getBoundingClientRect();
    x = (rect.left + rect.width / 2) / window.innerWidth;
    y = (rect.top + rect.height / 2) / window.innerHeight;
  }

  // Dual-burst confetti
  confetti({
    particleCount: 40,
    spread: 60,
    origin: { x, y },
    colors: ["#FF6154", "#FFA354", "#FFD254", "#FF3366", "#FF9900"],
    startVelocity: 25,
    ticks: 200,
    gravity: 1.2,
    scalar: 0.9,
    shapes: ["circle", "square"],
    disableForReducedMotion: true,
  });
}

export function fireLaunchCelebration() {
  if (typeof window === "undefined") return;

  const duration = 2.5 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 };

  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    // Launch from both sides
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.1, y: Math.random() - 0.2 },
      colors: ["#FF6154", "#FF884D", "#FFB347", "#FF4500", "#FFD700"],
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: 0.9, y: Math.random() - 0.2 },
      colors: ["#FF6154", "#FF884D", "#FFB347", "#FF4500", "#FFD700"],
    });
  }, 250);
}
