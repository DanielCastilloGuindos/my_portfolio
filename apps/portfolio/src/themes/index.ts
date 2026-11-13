// apps/portfolio/src/themes/index.ts
// Theme registry: exports all available themes and a lookup helper.

import defaultTheme from './default';
import minimalTheme from './minimal';
import creativeTheme from './creative';

export interface ThemeAnimationConfig {
  entranceDuration: number;
  stagger: number;
  ease: string;
  hero: {
    y: number;
    opacity: number;
    duration: number;
    delay: number;
    ease: string;
  };
  card: {
    y: number;
    opacity: number;
    duration: number;
    stagger: number;
    delay: number;
    ease: string;
  };
  badge: {
    scale: number;
    opacity: number;
    duration: number;
    stagger: number;
    delay: number;
    ease: string;
  };
}

export interface Theme {
  id: string;
  name: string;
  description: string;
  cssVariables: Record<string, string>;
  font?: {
    display: string;
    text: string;
  };
  animation: ThemeAnimationConfig;
}

const themes: Record<string, Theme> = {
  default: defaultTheme,
  minimal: minimalTheme,
  creative: creativeTheme,
};

export { defaultTheme, minimalTheme, creativeTheme };
export { themes };

/**
 * Returns the theme for the given themeId, falling back to the default theme
 * when the id is not found.
 */
export function getTheme(themeId: string): Theme {
  return themes[themeId] ?? themes.default;
}

export type { Theme, ThemeAnimationConfig };
