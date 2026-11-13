// apps/portfolio/src/themes/creative.ts
// Kanagawa Lotus / Wave variant: SumiInk background, Crystal Blue & Spring Violet accents.

import type { Theme } from './index';

const creativeTheme: Theme = {
  id: 'creative',
  name: 'Kanagawa Wave',
  description: 'Kanagawa palette with crystal blue and wave aqua accents.',
  cssVariables: {
    '--color-bg': '#1F1F28',
    '--color-surface': '#252535',
    '--color-surface-hover': '#2D4F67',
    '--color-text': '#DCD7BA',
    '--color-text-secondary': '#9CABCA',
    '--color-accent': '#7E9CD8',
    '--color-accent-hover': '#7FB4CA',
    '--color-border': '#363646',
    '--color-blue': '#7E9CD8',
    '--color-aqua': '#7AA89F',
    '--color-green': '#76946A',
    '--radius-md': '2px',
    '--radius-lg': '4px',
  },
  font: {
    display: "'Bricolage Grotesque', system-ui, sans-serif",
    text: "'Bricolage Grotesque', system-ui, sans-serif",
  },
  animation: {
    entranceDuration: 1.1,
    stagger: 0.15,
    ease: 'power4.out',
    hero: {
      y: 40,
      opacity: 0,
      duration: 1.1,
      delay: 0,
      ease: 'power4.out',
    },
    card: {
      y: 32,
      opacity: 0,
      duration: 0.9,
      stagger: 0.15,
      delay: 0.2,
      ease: 'power3.out',
    },
    badge: {
      scale: 0.85,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.4,
      ease: 'back.out(1.4)',
    },
  },
};

export default creativeTheme;
