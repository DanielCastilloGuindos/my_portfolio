<script setup lang="ts">
import { onMounted, watch, type Ref } from 'vue';
import gsap from 'gsap';
import type { Theme } from '../themes/index';

const props = defineProps<{
  theme: Theme;
}>();

const emit = defineEmits(['animation-complete']);

/**
 * Applies the theme's CSS variables to the root element.
 */
function applyCssVariables(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.cssVariables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });
}

/**
 * Returns true when the user prefers reduced motion.
 */
function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;
}

/**
 * Animates the page entrance using GSAP, driven by the theme's animation
 * config. Only animates compositor-friendly properties (transform, opacity)
 * and respects prefers-reduced-motion. Targets only elements that exist.
 */
function animateEntrance(): void {
  if (prefersReducedMotion()) {
    emit('animation-complete');
    return;
  }

  const { animation } = props.theme;

  // Animate section headings and content blocks that actually exist in the DOM.
  const headings = document.querySelectorAll<HTMLElement>('h1, h2');
  const contentBlocks = document.querySelectorAll<HTMLElement>(
    '.hero-content, .frame-content, .card-body, .contact-form, .contact-card, .footer-column',
  );

  gsap.from(headings, {
    y: animation.hero.y,
    opacity: animation.hero.opacity,
    duration: animation.hero.duration,
    delay: animation.hero.delay,
    ease: animation.hero.ease,
    stagger: 0.1,
  });

  gsap.from(contentBlocks, {
    y: animation.card.y,
    opacity: animation.card.opacity,
    duration: animation.card.duration,
    stagger: animation.card.stagger,
    delay: animation.card.delay,
    ease: animation.card.ease,
    onComplete: () => emit('animation-complete'),
  });
}

onMounted(() => {
  applyCssVariables(props.theme);
});

watch(
  () => props.theme,
  (theme) => {
    applyCssVariables(theme);
  },
  { deep: true },
);

defineExpose({
  animateEntrance,
  applyCssVariables,
});
</script>
