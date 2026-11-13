<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Project, PortfolioProject, ProjectType } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';

gsap.registerPlugin(ScrollTrigger);

type ProjectItem = Project & PortfolioProject;
type FilterType = 'all' | 'web' | 'game';

const props = defineProps<{
  projects: ProjectItem[];
  theme: Theme;
}>();

const rootEl = ref<HTMLElement | null>(null);
const pinContainerEl = ref<HTMLElement | null>(null);
const trackEl = ref<HTMLElement | null>(null);

const activeFilter = ref<FilterType>('all');

let ctx: gsap.Context | null = null;
let horizontalScrollTrigger: ScrollTrigger | null = null;

const filteredProjects = computed<ProjectItem[]>(() => {
  if (activeFilter.value === 'all') return props.projects;
  return props.projects.filter((p) => p.type === activeFilter.value);
});

const counts = computed(() => ({
  all: props.projects.length,
  web: props.projects.filter((p) => p.type === 'web').length,
  game: props.projects.filter((p) => p.type === 'game').length,
}));

function setupHorizontalScroll(): void {
  // Teardown previous instances before re-initializing
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  horizontalScrollTrigger = null;

  if (prefersReducedMotion() || !pinContainerEl.value || !trackEl.value) {
    return;
  }

  const track = trackEl.value;
  const section = pinContainerEl.value;

  ctx = gsap.context(() => {
    // Total distance the track needs to slide to reach the end
    const getScrollDistance = () => {
      const scrollWidth = track.scrollWidth;
      const viewportWidth = window.innerWidth;
      // Extra breathing room padding (96px)
      return Math.max(0, scrollWidth - viewportWidth + 96);
    };

    const dist = getScrollDistance();
    if (dist <= 0) return;

    // Reset initial translation
    gsap.set(track, { x: 0 });

    const tween = gsap.to(track, {
      x: () => -getScrollDistance(),
      ease: 'none',
      scrollTrigger: {
        trigger: section,
        pin: true,
        start: 'top top',
        end: () => `+=${getScrollDistance()}`,
        scrub: 1,
        invalidateOnRefresh: true,
      },
    });

    horizontalScrollTrigger = tween.scrollTrigger ?? null;
  }, rootEl.value);
}

async function setFilter(filter: FilterType): Promise<void> {
  if (activeFilter.value === filter) return;
  activeFilter.value = filter;

  await nextTick();

  // Reset track position before recalculating
  if (trackEl.value) {
    gsap.set(trackEl.value, { x: 0 });
  }

  setupHorizontalScroll();
  ScrollTrigger.refresh();
}

watch(
  () => props.projects,
  async () => {
    await nextTick();
    setupHorizontalScroll();
    ScrollTrigger.refresh();
  },
  { deep: true },
);

onMounted(() => {
  nextTick(() => {
    setupHorizontalScroll();
  });
});

onUnmounted(() => {
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
});
</script>

<template>
  <section
    id="portfolio"
    ref="rootEl"
    class="portfolio-section"
    aria-labelledby="portfolio-heading"
  >
    <div ref="pinContainerEl" class="pin-viewport">
      <!-- Section Header with Category Filters -->
      <div class="header-container">
        <div class="title-block">
          <h2 id="portfolio-heading" class="section-title">Portfolio de Proyectos</h2>
          <p class="section-subtitle">Galería interactiva en scroll horizontal con arquitectura modular</p>
        </div>

        <!-- Category Filter Selector -->
        <div class="filter-bar" role="tablist" aria-label="Filtrar proyectos por categoría">
          <button
            type="button"
            role="tab"
            class="filter-btn"
            :class="{ 'is-active': activeFilter === 'all' }"
            :aria-selected="activeFilter === 'all'"
            @click="setFilter('all')"
          >
            Todos
            <span class="filter-count">{{ counts.all }}</span>
          </button>
          <button
            type="button"
            role="tab"
            class="filter-btn"
            :class="{ 'is-active': activeFilter === 'web' }"
            :aria-selected="activeFilter === 'web'"
            @click="setFilter('web')"
          >
            Web
            <span class="filter-count">{{ counts.web }}</span>
          </button>
          <button
            type="button"
            role="tab"
            class="filter-btn"
            :class="{ 'is-active': activeFilter === 'game' }"
            :aria-selected="activeFilter === 'game'"
            @click="setFilter('game')"
          >
            Games
            <span class="filter-count">{{ counts.game }}</span>
          </button>
        </div>
      </div>

      <!-- Horizontal Sliding Track Container -->
      <div class="track-wrapper">
        <div ref="trackEl" class="projects-track">
          <article
            v-for="project in filteredProjects"
            :key="project.id || project.title"
            class="project-item"
          >
            <!-- Laptop Mockup Item -->
            <div class="laptop-mockup">
              <!-- Laptop Screen -->
              <div class="laptop-screen">
                <!-- Camera Notch / Bezel -->
                <div class="laptop-camera" aria-hidden="true"></div>

                <!-- Display Inner Viewport -->
                <div class="laptop-display">
                  <!-- Category Badge Tag -->
                  <span
                    class="project-type-badge"
                    :class="[project.type === 'game' ? 'badge-game' : 'badge-web']"
                  >
                    {{ project.type === 'game' ? 'GAME' : 'WEB' }}
                  </span>

                  <!-- Project Preview Image -->
                  <img
                    :src="project.previewImageUrl || project.imageUrl"
                    :alt="`Previsualización de ${project.title || project.name}`"
                    class="laptop-preview-img"
                    loading="lazy"
                  />

                  <!-- Smooth Hover Detail Panel over Screen -->
                  <div class="laptop-hover-overlay">
                    <div class="overlay-content">
                      <h4 class="overlay-title">{{ project.title || project.name }}</h4>
                      <p class="overlay-summary">{{ project.summary || project.description }}</p>

                      <!-- Key Highlights / Features -->
                      <div v-if="project.features && project.features.length" class="overlay-features">
                        <span class="overlay-section-label">Características clave:</span>
                        <ul class="features-list">
                          <li v-for="(feat, fIdx) in project.features.slice(0, 3)" :key="fIdx">
                            {{ feat }}
                          </li>
                        </ul>
                      </div>

                      <!-- Stack Badges -->
                      <div v-if="(project.stack && project.stack.length) || (project.tags && project.tags.length)" class="overlay-stack">
                        <span
                          v-for="tech in (project.stack || project.tags)"
                          :key="tech"
                          class="stack-pill"
                        >
                          {{ tech }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Laptop Base / Chassis -->
              <div class="laptop-base" aria-hidden="true">
                <div class="laptop-notch"></div>
              </div>
            </div>

            <!-- Project Bottom Info & Always Visible CTAs -->
            <div class="card-bottom-info">
              <div class="meta-row">
                <h3 class="card-title">{{ project.title || project.name }}</h3>
              </div>

              <!-- Actions: Primary CTA Always Visible for Accessibility & Mobile -->
              <div class="card-actions">
                <a
                  v-if="project.liveUrl || project.url"
                  :href="project.liveUrl || project.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cta-primary-btn"
                  :aria-label="project.type === 'game' ? `Jugar ahora a ${project.title || project.name}` : `Ver proyecto ${project.title || project.name}`"
                >
                  <span>{{ project.type === 'game' ? 'Jugar ahora' : 'Ver proyecto' }}</span>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                    <polyline points="15 3 21 3 21 9"></polyline>
                    <line x1="10" y1="14" x2="21" y2="3"></line>
                  </svg>
                </a>

                <a
                  v-if="project.repoUrl"
                  :href="project.repoUrl"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="cta-secondary-btn"
                  :aria-label="`Ver código en repositorio de ${project.title || project.name}`"
                >
                  <span>Código</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                  </svg>
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.portfolio-section {
  position: relative;
  width: 100%;
  overflow: clip;
}

.pin-viewport {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 60px 0;
  box-sizing: border-box;
}

/* Header & Filter Bar */
.header-container {
  max-width: 1240px;
  width: 100%;
  margin: 0 auto;
  padding: 0 32px 30px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  z-index: 5;
}

.title-block {
  flex: 1;
  min-width: 280px;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px;
  letter-spacing: -0.03em;
}

.section-subtitle {
  font-size: 1.02rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(42, 42, 55, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  padding: 4px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid transparent;
  border-radius: 2px;
  padding: 7px 14px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  touch-action: manipulation;
}

.filter-btn:hover {
  color: var(--color-text);
  background: rgba(220, 215, 186, 0.05);
}

.filter-btn.is-active {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.filter-count {
  display: inline-block;
  font-size: 0.75rem;
  padding: 1px 6px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.2);
  line-height: 1.2;
}

.filter-btn.is-active .filter-count {
  background: rgba(31, 31, 40, 0.35);
  color: var(--color-bg);
}

/* Horizontal Track */
.track-wrapper {
  position: relative;
  width: 100%;
  overflow: visible;
  padding: 10px 0;
}

.projects-track {
  display: flex;
  align-items: stretch;
  gap: 40px;
  padding: 0 48px;
  width: max-content;
  will-change: transform;
}

/* Single Project Item */
.project-item {
  width: 540px;
  max-width: 85vw;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
}

/* Laptop Mockup */
.laptop-mockup {
  position: relative;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Screen */
.laptop-screen {
  position: relative;
  width: 100%;
  height: 310px;
  background: #141318;
  border: 10px solid #282732;
  border-bottom: 12px solid #282732;
  border-radius: 12px 12px 2px 2px;
  box-shadow: 0 16px 36px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(255, 255, 255, 0.05);
  overflow: hidden;
  box-sizing: border-box;
}

.laptop-camera {
  position: absolute;
  top: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 5px;
  height: 5px;
  background: #3e3d4c;
  border-radius: 50%;
  z-index: 10;
}

/* Display */
.laptop-display {
  position: relative;
  width: 100%;
  height: 100%;
  background: #0d0c10;
  overflow: hidden;
}

.laptop-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Category Badge (WEB / GAME) */
.project-type-badge {
  position: absolute;
  top: 12px;
  left: 12px;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  padding: 3px 8px;
  border-radius: 2px;
  text-transform: uppercase;
  z-index: 4;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
}

.badge-web {
  background: var(--color-accent);
  color: var(--color-bg);
}

.badge-game {
  background: var(--color-accent-hover);
  color: var(--color-bg);
}

/* Laptop Base */
.laptop-base {
  position: relative;
  width: 110%;
  height: 14px;
  background: linear-gradient(180deg, #32313e 0%, #1c1b24 100%);
  border-radius: 0 0 12px 12px;
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  z-index: 2;
}

.laptop-notch {
  width: 70px;
  height: 4px;
  background: #18171f;
  border-radius: 0 0 4px 4px;
}

/* Hover Details Overlay over Screen */
.laptop-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(25, 25, 34, 0.94);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.3s cubic-bezier(0.16, 1, 0.3, 1), visibility 0.3s ease;
  padding: 22px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  z-index: 5;
}

.laptop-mockup:hover .laptop-hover-overlay,
.laptop-mockup:focus-within .laptop-hover-overlay {
  opacity: 1;
  visibility: visible;
}

.overlay-content {
  overflow-y: auto;
  max-height: 100%;
}

.overlay-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 8px;
  letter-spacing: -0.01em;
}

.overlay-summary {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
}

.overlay-section-label {
  display: block;
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  margin-bottom: 6px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 14px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.features-list li {
  position: relative;
  font-size: 0.82rem;
  line-height: 1.45;
  color: var(--color-text);
  padding-left: 14px;
}

.features-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--color-accent);
}

.overlay-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.stack-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  background: rgba(230, 195, 132, 0.12);
  color: var(--color-accent);
  border: 1px solid rgba(230, 195, 132, 0.25);
  border-radius: 2px;
}

/* Card Bottom Info & Always Visible CTAs */
.card-bottom-info {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.card-title {
  font-size: 1.18rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

/* Action Buttons (Always Visible) */
.card-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.cta-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: var(--color-accent);
  color: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: 2px;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.2s ease, transform 0.2s ease;
  touch-action: manipulation;
}

.cta-primary-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.cta-secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  font-size: 0.86rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease, border-color 0.2s ease;
}

.cta-secondary-btn:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
}

/* Mobile & Reduced Motion Responsive */
@media (max-width: 768px) {
  .pin-viewport {
    padding: 40px 0;
  }

  .header-container {
    padding: 0 20px 20px;
    flex-direction: column;
    align-items: flex-start;
  }

  .projects-track {
    padding: 0 20px;
    gap: 24px;
  }

  .project-item {
    width: 320px;
  }

  .laptop-screen {
    height: 220px;
  }
}
</style>
