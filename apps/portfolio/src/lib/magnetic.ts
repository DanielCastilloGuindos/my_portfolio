// apps/portfolio/src/lib/magnetic.ts
// Reusable magnetic button micro-interaction using GSAP quickTo.
// Respects prefers-reduced-motion and is enabled only on pointer: fine devices.

import gsap from 'gsap';
import { prefersReducedMotion } from './format';

export interface MagneticOptions {
  strength?: number;
  textStrength?: number;
  radius?: number;
}

export function setupMagnetic(
  element: HTMLElement,
  options?: MagneticOptions,
): () => void {
  if (
    prefersReducedMotion() ||
    typeof window === 'undefined' ||
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    return () => {};
  }

  const strength = options?.strength ?? 0.32;
  const textStrength = options?.textStrength ?? 0.18;

  const childTarget = element.querySelector<HTMLElement>('span, svg');

  const xTo = gsap.quickTo(element, 'x', { duration: 0.45, ease: 'power3.out' });
  const yTo = gsap.quickTo(element, 'y', { duration: 0.45, ease: 'power3.out' });

  const childXTo = childTarget
    ? gsap.quickTo(childTarget, 'x', { duration: 0.35, ease: 'power3.out' })
    : null;
  const childYTo = childTarget
    ? gsap.quickTo(childTarget, 'y', { duration: 0.35, ease: 'power3.out' })
    : null;

  const onMouseMove = (e: MouseEvent) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;

    xTo(deltaX);
    yTo(deltaY);

    if (childXTo && childYTo) {
      childXTo(deltaX * textStrength);
      childYTo(deltaY * textStrength);
    }
  };

  const onMouseLeave = () => {
    xTo(0);
    yTo(0);
    if (childXTo && childYTo) {
      childXTo(0);
      childYTo(0);
    }
  };

  element.addEventListener('mousemove', onMouseMove);
  element.addEventListener('mouseleave', onMouseLeave);

  return () => {
    element.removeEventListener('mousemove', onMouseMove);
    element.removeEventListener('mouseleave', onMouseLeave);
    gsap.set(element, { x: 0, y: 0 });
    if (childTarget) {
      gsap.set(childTarget, { x: 0, y: 0 });
    }
  };
}
