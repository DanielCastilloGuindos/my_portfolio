<template>
  <section class="timeline" data-section="timeline">
    <div class="timeline__header">
      <span class="timeline__label text-mono">TIMELINE</span>
      <h2 class="timeline__title">Career Roadmap</h2>
    </div>

    <div class="timeline__content">
      <svg class="timeline__line" ref="lineRef" viewBox="0 0 4 800" preserveAspectRatio="none">
        <line
          x1="2"
          y1="0"
          x2="2"
          y2="800"
          stroke="url(#lineGradient)"
          stroke-width="2"
          stroke-dasharray="800"
          stroke-dashoffset="800"
        />
        <defs>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#2563eb" />
            <stop offset="50%" stop-color="#06b6d4" />
            <stop offset="100%" stop-color="#10b981" />
          </linearGradient>
        </defs>
      </svg>

      <div class="timeline__items">
        <div
          v-for="(milestone, index) in data.timeline"
          :key="index"
          class="timeline-item"
          :class="{ 'timeline-item--current': milestone.current, 'timeline-item--right': index % 2 === 1 }"
        >
          <div class="timeline-item__node">
            <div class="timeline-item__dot" :class="{ 'timeline-item__dot--current': milestone.current }">
              <svg v-if="milestone.current" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2L9.5 6.5L14 8L9.5 9.5L8 14L6.5 9.5L2 8L6.5 6.5L8 2Z" fill="currentColor"/>
              </svg>
            </div>
          </div>

          <div class="timeline-item__content glass">
            <span class="timeline-item__label text-mono" :class="milestone.current ? 'badge-blue' : 'badge-cyan'">
              {{ milestone.label }}
            </span>
            <h3 class="timeline-item__year">{{ milestone.year }}</h3>
            <h4 class="timeline-item__title">{{ milestone.title }}</h4>
            <p class="timeline-item__description">{{ milestone.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import data from '@/data.json';

gsap.registerPlugin(ScrollTrigger);

const lineRef = ref<SVGSVGElement | null>(null);

onMounted(() => {
  // Animate the SVG line drawing
  const line = lineRef.value?.querySelector('line');
  if (line) {
    gsap.to(line, {
      strokeDashoffset: 0,
      duration: 2,
      ease: 'power2.inOut',
      scrollTrigger: {
        trigger: '.timeline',
        start: 'top center',
        end: 'bottom center',
        scrub: 1
      }
    });
  }

  // Animate timeline items
  const items = document.querySelectorAll('.timeline-item');
  items.forEach((item, index) => {
    gsap.from(item, {
      opacity: 0,
      x: index % 2 === 0 ? -50 : 50,
      duration: 0.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: item,
        start: 'top 80%',
        toggleActions: 'play none none reverse'
      }
    });
  });
});
</script>

<style scoped lang="scss">
.timeline {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: $spacing-3xl $spacing-lg;
  position: relative;

  &__header {
    text-align: center;
    margin-bottom: $spacing-2xl;
    position: relative;
    z-index: 2;
  }

  &__label {
    display: block;
    color: $accent-blue;
    font-size: $font-size-sm;
    letter-spacing: 0.2em;
    margin-bottom: $spacing-xs;
    text-transform: uppercase;
  }

  &__title {
    font-size: $font-size-5xl;
    font-weight: $font-weight-black;
    background: linear-gradient(135deg, $text-primary 0%, $text-muted 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin-bottom: $spacing-md;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-3xl;
    }
  }

  &__subtitle {
    color: $text-secondary;
    font-size: $font-size-sm;
  }

  &__content {
    position: relative;
    width: 100%;
    max-width: 1000px;
  }

  &__line {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    height: 100%;
    width: 4px;
    z-index: 0;

    @media (max-width: $breakpoint-md) {
      left: $spacing-lg;
    }
  }

  &__items {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: $spacing-3xl;
    padding: $spacing-lg 0;
  }
}

.timeline-item {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: $spacing-lg;
  align-items: center;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: auto 1fr;
  }

  &--right {
    .timeline-item__content {
      grid-column: 3;
    }

    @media (max-width: $breakpoint-md) {
      .timeline-item__content {
        grid-column: 2;
      }
    }
  }

  &:not(&--right) {
    .timeline-item__content {
      grid-column: 1;
    }

    @media (max-width: $breakpoint-md) {
      .timeline-item__content {
        grid-column: 2;
      }
    }
  }

  &__node {
    grid-column: 2;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;

    @media (max-width: $breakpoint-md) {
      grid-column: 1;
    }
  }

  &__dot {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: $accent-blue;
    border: 4px solid $bg-primary;
    box-shadow: $glow-blue-md;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-primary;

    &--current {
      width: 32px;
      height: 32px;
      background: $accent-green;
      box-shadow: $glow-green-lg;
      animation: pulse 2s ease-in-out infinite;
    }
  }

  &__content {
    padding: $spacing-lg;
    border-radius: 1rem;
    transition: all $transition-base $ease-in-out;

    &:hover {
      transform: translateY(-4px);
      box-shadow: $shadow-2xl, $glow-blue-sm;
    }
  }

  &__label {
    display: inline-block;
    font-size: $font-size-xs;
    color: $accent-blue;
    margin-bottom: $spacing-xs;
  }

  &__year {
    font-size: $font-size-4xl;
    font-weight: $font-weight-black;
    margin-bottom: $spacing-xs;
  }

  &__title {
    font-size: $font-size-xl;
    font-weight: $font-weight-semibold;
    margin-bottom: $spacing-sm;
  }

  &__description {
    color: $text-secondary;
    line-height: 1.6;
  }

  &--current {
    .timeline-item__label {
      color: $accent-green;
    }

    .timeline-item__year {
      background: linear-gradient(135deg, $accent-green, $accent-cyan);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
  }
}
</style>
