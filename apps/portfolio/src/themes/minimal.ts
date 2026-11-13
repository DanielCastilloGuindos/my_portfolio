// apps/portfolio/src/themes/minimal.ts
// Kanagawa Dragon variant: Dark charcoal ink, muted stone, autumn green & surimi orange accent.

import type { Theme } from './index';

const minimalTheme: Theme = {
  id: 'minimal',
  name: 'Kanagawa Dragon',
  description: 'Deep dragon ink ground with warm stone and surimi orange accent.',
  cssVariables: {
    '--color-bg': '#181616',
    '--color-surface': '#222020',
    '--color-surface-hover': '#2D2A2A',
    '--color-text': '#C5C9C5',
    '--color-text-secondary': '#8A9AA3',
    '--color-accent': '#FFA066',
    '--color-accent-hover': '#FF9E3B',
    '--color-border': '#343232',
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
    entranceDuration: 0.7,
    stagger: 0.1,
    ease: 'quad.out',
    hero: {
      y: 24,
      opacity: 0,
      duration: 0.7,
      delay: 0,
      ease: 'quad.out',
    },
    card: {
      y: 20,
      opacity: 0,
      duration: 0.6,
      stagger: 0.1,
      delay: 0.1,
      ease: 'quad.out',
    },
    badge: {
      scale: 0.9,
      opacity: 0,
      duration: 0.4,
      stagger: 0.05,
      delay: 0.2,
      ease: 'quad.out',
    },
  },
};

export default minimalTheme;
