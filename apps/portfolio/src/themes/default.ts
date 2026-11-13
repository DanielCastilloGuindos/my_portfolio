// apps/portfolio/src/themes/default.ts
// Authentic Kanagawa theme palette:
// Background: SumiInk3 (#1F1F28), Surface: SumiInk4 (#2A2A37), SurfaceHover: SumiInk5 (#363646)
// Text: FujiWhite (#DCD7BA), Secondary: OldWhite (#C8C093) / KatanaGray (#717C7C)
// Accent: CarpYellow (#E6C384) / CrystalBlue (#7E9CD8) / SurimiOrange (#FFA066)
// Border: SumiInk5 (#363646)

import type { Theme } from './index';

const defaultTheme: Theme = {
  id: 'default',
  name: 'Kanagawa',
  description: 'Authentic Kanagawa: Sumi ink, Fuji white, and carp yellow accent.',
  cssVariables: {
    '--color-bg': '#1F1F28',
    '--color-surface': '#2A2A37',
    '--color-surface-hover': '#363646',
    '--color-text': '#DCD7BA',
    '--color-text-secondary': '#C8C093',
    '--color-accent': '#E6C384',
    '--color-accent-hover': '#FFA066',
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
    entranceDuration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
    hero: {
      y: 32,
      opacity: 0,
      duration: 0.9,
      delay: 0,
      ease: 'power3.out',
    },
    card: {
      y: 24,
      opacity: 0,
      duration: 0.7,
      stagger: 0.12,
      delay: 0.15,
      ease: 'power2.out',
    },
    badge: {
      scale: 0.9,
      opacity: 0,
      duration: 0.5,
      stagger: 0.08,
      delay: 0.3,
      ease: 'quad.out',
    },
  },
};

export default defaultTheme;
