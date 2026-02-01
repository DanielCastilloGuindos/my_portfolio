<template>
  <section class="projects" data-section="projects">
    <div class="projects__header">
      <span class="projects__label text-mono">PORTFOLIO</span>
      <h2 class="projects__title">Selected Works</h2>
    </div>

    <div class="projects__carousel">
      <div class="projects__track" ref="trackRef">
        <div
          v-for="(project, index) in data.projects"
          :key="project.id"
          class="project-card glass"
          :style="{ '--index': index }"
        >
          <div class="project-card__image">
            <img :src="project.image" :alt="project.title" />
            <span class="project-card__status badge badge-green">{{ project.status }}</span>
          </div>

          <div class="project-card__content">
            <h3 class="project-card__title">{{ project.title }}</h3>
            <p class="project-card__subtitle">{{ project.subtitle }} • {{ project.year }}</p>
            <p class="project-card__description">{{ project.description }}</p>

            <div class="project-card__tags">
              <span v-for="tag in project.tags" :key="tag" class="tag">{{ tag }}</span>
            </div>

            <div class="project-card__links">
              <a v-if="project.links.live" :href="project.links.live" class="icon-link" title="Live Demo">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 10H18" stroke="currentColor" stroke-width="2"/>
                  <path d="M10 2C11.6569 4.68629 12.5 7.79086 12.5 11C12.5 14.2091 11.6569 17.3137 10 20C8.34315 17.3137 7.5 14.2091 7.5 11C7.5 7.79086 8.34315 4.68629 10 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </a>
              <a v-if="project.links.github" :href="project.links.github" class="icon-link" title="GitHub">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 2C5.58 2 2 5.58 2 10C2 13.54 4.29 16.53 7.47 17.59C7.87 17.66 8.02 17.42 8.02 17.21C8.02 17.02 8.01 16.39 8.01 15.72C6 16.09 5.48 15.21 5.32 14.8C5.23 14.59 4.84 13.88 4.5 13.69C4.22 13.54 3.82 13.17 4.49 13.16C5.12 13.15 5.57 13.74 5.72 13.98C6.44 15.17 7.59 14.83 8.05 14.62C8.12 14.1 8.33 13.75 8.56 13.55C6.84 13.35 5.04 12.68 5.04 9.58C5.04 8.71 5.23 8 5.74 7.44C5.66 7.24 5.38 6.44 5.82 5.37C5.82 5.37 6.49 5.16 8.02 6.21C8.66 6.03 9.34 5.94 10.02 5.94C10.7 5.94 11.38 6.03 12.02 6.21C13.55 5.15 14.22 5.37 14.22 5.37C14.66 6.44 14.38 7.24 14.3 7.44C14.81 8 15 8.7 15 9.58C15 12.69 13.19 13.35 11.47 13.55C11.76 13.8 12.01 14.28 12.01 15.04C12.01 16.12 12 16.98 12 17.21C12 17.42 12.15 17.67 12.55 17.59C14.1381 17.0539 15.5182 16.0332 16.4958 14.6716C17.4735 13.3101 17.9996 11.6762 18 10C18 5.58 14.42 2 10 2Z" fill="currentColor"/>
                </svg>
              </a>
              <a v-if="project.links.case" :href="project.links.case" class="btn btn-primary btn-sm">
                View Case Study
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 8H13M13 8L9 4M13 8L9 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="projects__nav">
        <button class="nav-btn" @click="prevProject" aria-label="Previous">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button class="nav-btn" @click="nextProject" aria-label="Next">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
      </div>
    </div>

    <div class="projects__hint text-mono">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2V14M8 14L12 10M8 14L4 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Use arrow keys to navigate or click side cards
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import gsap from 'gsap';
import data from '../data.json';

const trackRef = ref<HTMLElement | null>(null);
const currentIndex = ref(0);

const nextProject = () => {
  if (currentIndex.value < data.projects.length - 1) {
    currentIndex.value++;
    updateCarousel();
  }
};

const prevProject = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--;
    updateCarousel();
  }
};

const updateCarousel = () => {
  const cards = trackRef.value?.querySelectorAll('.project-card');
  if (!cards) return;

  cards.forEach((card, index) => {
    const offset = index - currentIndex.value;
    
    gsap.to(card, {
      x: offset * 100 + '%',
      z: offset * -200,
      opacity: offset === 0 ? 1 : 0.4,
      scale: offset === 0 ? 1 : 0.8,
      duration: 0.6,
      ease: 'power2.out'
    });
  });
};
</script>

<style scoped lang="scss">
.projects {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl $spacing-lg;
  position: relative;

  &__header {
    text-align: center;
    margin-bottom: $spacing-3xl;
  }

  &__label {
    display: block;
    color: $accent-blue;
    font-size: $font-size-sm;
    margin-bottom: $spacing-sm;
  }

  &__title {
    font-size: $font-size-5xl;
  }

  &__carousel {
    position: relative;
    width: 100%;
    max-width: 800px;
    height: 600px;
    perspective: 2000px;
  }

  &__track {
    position: relative;
    width: 100%;
    height: 100%;
    transform-style: preserve-3d;
  }

  &__nav {
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    transform: translateY(-50%);
    display: flex;
    justify-content: space-between;
    padding: 0 $spacing-lg;
    pointer-events: none;
    z-index: 10;
  }

  &__hint {
    margin-top: $spacing-2xl;
    display: flex;
    align-items: center;
    gap: $spacing-xs;
    color: $text-muted;
    font-size: $font-size-sm;
  }
}

.project-card {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 1rem;
  overflow: hidden;
  transition: transform 0.6s ease;

  &__image {
    position: relative;
    width: 100%;
    height: 250px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__status {
    position: absolute;
    top: $spacing-md;
    left: $spacing-md;
  }

  &__content {
    padding: $spacing-lg;
  }

  &__title {
    font-size: $font-size-2xl;
    margin-bottom: $spacing-xs;
  }

  &__subtitle {
    color: $text-secondary;
    font-size: $font-size-sm;
    margin-bottom: $spacing-md;
  }

  &__description {
    color: $text-secondary;
    line-height: 1.6;
    margin-bottom: $spacing-md;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: $spacing-xs;
    margin-bottom: $spacing-lg;
  }

  &__links {
    display: flex;
    align-items: center;
    gap: $spacing-md;
  }
}

.tag {
  padding: $spacing-xs $spacing-sm;
  background: rgba($accent-blue, 0.1);
  color: $accent-blue;
  border: 1px solid rgba($accent-blue, 0.3);
  border-radius: 0.25rem;
  font-size: $font-size-xs;
  font-family: $font-mono;
}

.icon-link {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 0.5rem;
  background: rgba($text-primary, 0.05);
  color: $text-secondary;
  transition: all $transition-base $ease-in-out;
  pointer-events: auto;

  &:hover {
    background: rgba($accent-blue, 0.1);
    color: $accent-blue;
    box-shadow: $glow-blue-sm;
  }
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba($bg-secondary, 0.8);
  backdrop-filter: blur($blur-md);
  border: 1px solid rgba($text-primary, 0.1);
  color: $text-primary;
  cursor: pointer;
  transition: all $transition-base $ease-in-out;
  pointer-events: auto;

  &:hover {
    background: rgba($accent-blue, 0.2);
    border-color: $accent-blue;
    box-shadow: $glow-blue-sm;
  }
}

.btn-sm {
  padding: $spacing-xs $spacing-md;
  font-size: $font-size-sm;
}
</style>
