<template>
  <section class="hero" data-section="hero">
    <div class="hero__content">
      <div class="hero__badge">
        <span class="badge badge-cyan">{{ data.hero.badge }}</span>
      </div>

      <h1 class="hero__title">
        <span class="hero__greeting">HOLA, SOY</span>
        <span class="hero__name">{{ data.hero.name }}</span>
      </h1>

      <p class="hero__subtitle text-gradient">{{ data.hero.title }}</p>

      <div class="hero__actions">
        <button class="btn btn-primary">
          {{ data.hero.cta.primary }}
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="btn btn-secondary">{{ data.hero.cta.secondary }}</button>
      </div>

      <div class="hero__scroll">
        <span class="text-mono">SCROLL</span>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M10 4V16M10 16L14 12M10 16L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import gsap from 'gsap';
import data from '@/data.json';

onMounted(() => {
  // Stagger animation for hero elements
  const tl = gsap.timeline({ delay: 0.3 });

  tl.from('.hero__badge', {
    opacity: 0,
    y: -20,
    duration: 0.6,
    ease: 'power2.out'
  })
  .from('.hero__greeting', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.3')
  .from('.hero__name', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.6')
  .from('.hero__subtitle', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4')
  .from('.hero__actions .btn', {
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.3')
  .from('.hero__scroll', {
    opacity: 0,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.2');
});
</script>

<style scoped lang="scss">
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding: $spacing-2xl $spacing-lg;

  &__content {
    max-width: 900px;
    text-align: center;
  }

  &__badge {
    margin-bottom: $spacing-lg;
  }

  &__title {
    display: flex;
    flex-direction: column;
    gap: $spacing-xs;
    margin-bottom: $spacing-md;
  }

  &__greeting {
    font-size: $font-size-2xl;
    font-weight: $font-weight-medium;
    color: $text-secondary;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-xl;
    }
  }

  &__name {
    font-size: $font-size-7xl;
    font-weight: $font-weight-black;
    letter-spacing: -0.02em;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-5xl;
    }
  }

  &__subtitle {
    font-size: $font-size-xl;
    font-weight: $font-weight-medium;
    margin-bottom: $spacing-2xl;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-lg;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
    justify-content: center;
    flex-wrap: wrap;
    margin-bottom: $spacing-3xl;
  }

  &__scroll {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: $spacing-xs;
    color: $text-muted;
    font-size: $font-size-sm;
    animation: float 3s ease-in-out infinite;

    svg {
      opacity: 0.6;
    }
  }
}
</style>
