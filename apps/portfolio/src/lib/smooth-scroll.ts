import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from './format';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

/**
 * Initializes Lenis smooth scrolling synchronized with the GSAP ticker.
 * Binds ScrollTrigger.update on scroll and disables lagSmoothing.
 * Respects prefers-reduced-motion.
 */
export function initSmoothScroll(): { lenis: Lenis | null; cleanup: () => void } {
  // If user prefers reduced motion, do not initialize smooth inertia
  if (prefersReducedMotion() || typeof window === 'undefined') {
    return {
      lenis: null,
      cleanup: () => {},
    };
  }

  // Teardown existing instance if any
  cleanupSmoothScroll();

  const lenis = new Lenis({
    duration: 1.15,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    touchMultiplier: 1.8,
  });

  lenisInstance = lenis;

  // Sync Lenis scroll events with GSAP ScrollTrigger
  lenis.on('scroll', ScrollTrigger.update);

  // Sync GSAP ticker with Lenis requestAnimationFrame
  tickerCallback = (time: number) => {
    lenis.raf(time * 1000);
  };

  gsap.ticker.add(tickerCallback);
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    cleanup: cleanupSmoothScroll,
  };
}

/**
 * Destroys current Lenis instance and detaches from GSAP ticker.
 */
export function cleanupSmoothScroll(): void {
  if (tickerCallback) {
    gsap.ticker.remove(tickerCallback);
    tickerCallback = null;
  }
  if (lenisInstance) {
    lenisInstance.destroy();
    lenisInstance = null;
  }
}

/**
 * Returns current Lenis instance if active.
 */
export function getLenis(): Lenis | null {
  return lenisInstance;
}
