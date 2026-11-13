<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Flip } from 'gsap/Flip';
import type { Project, PortfolioProject, ProjectType } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';
import { getLenis } from '../lib/smooth-scroll';
import { setupMagnetic } from '../lib/magnetic';

gsap.registerPlugin(ScrollTrigger, Flip);

type ProjectItem = Project & PortfolioProject;
type FilterType = 'all' | 'web' | 'game';

const props = defineProps<{
  projects: ProjectItem[];
  theme: Theme;
}>();

const rootEl = ref<HTMLElement | null>(null);
const pinContainerEl = ref<HTMLElement | null>(null);
const carouselViewportEl = ref<HTMLElement | null>(null);
const trackEl = ref<HTMLElement | null>(null);
const narrativePanelEl = ref<HTMLElement | null>(null);

const activeFilter = ref<FilterType>('all');
const activeIndex = ref(0);

// Flip Modal States
const selectedProject = ref<ProjectItem | null>(null);
const isModalOpen = ref(false);
const modalScreenRef = ref<HTMLElement | null>(null);
let activeSourceEl: HTMLElement | null = null;

let ctx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;
let skewQuickToSetters: Array<(value: number) => void> = [];
let magneticCleanups: Array<() => void> = [];

const filteredProjects = computed<ProjectItem[]>(() => {
  if (activeFilter.value === 'all') return props.projects;
  return props.projects.filter((p) => p.type === activeFilter.value);
});

const currentProject = computed<ProjectItem | null>(() => {
  return filteredProjects.value[activeIndex.value] ?? filteredProjects.value[0] ?? null;
});

const counts = computed(() => ({
  all: props.projects.length,
  web: props.projects.filter((p) => p.type === 'web').length,
  game: props.projects.filter((p) => p.type === 'game').length,
}));

function setupMagneticButtons(): void {
  magneticCleanups.forEach((cleanup) => cleanup());
  magneticCleanups = [];

  const buttons = rootEl.value?.querySelectorAll<HTMLElement>('.cta-primary-btn, .cta-secondary-btn') ?? [];
  buttons.forEach((btn) => {
    const cleanup = setupMagnetic(btn, { strength: 0.3, textStrength: 0.16 });
    magneticCleanups.push(cleanup);
  });
}

/**
 * Updates the active project index and smoothly animates the clean typography on the left
 */
function updateActiveProject(newIndex: number): void {
  if (newIndex === activeIndex.value || newIndex < 0 || newIndex >= filteredProjects.value.length) {
    return;
  }
  activeIndex.value = newIndex;

  if (narrativePanelEl.value && !prefersReducedMotion()) {
    gsap.fromTo(
      narrativePanelEl.value.querySelectorAll('.narrative-animate-item'),
      { y: 10, autoAlpha: 0 },
      { y: 0, autoAlpha: 1, duration: 0.32, stagger: 0.03, ease: 'power2.out', overwrite: 'auto' },
    );
  }
}

function setupHorizontalMotion(): void {
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  skewQuickToSetters = [];

  if (prefersReducedMotion() || !pinContainerEl.value || !trackEl.value || !carouselViewportEl.value) {
    return;
  }

  const track = trackEl.value;
  const viewport = carouselViewportEl.value;
  const section = pinContainerEl.value;

  ctx = gsap.context(() => {
    mm = gsap.matchMedia();

    // Desktop split layout (width >= 992px): Left text fixed, Right carousel strictly clipped in viewport
    mm.add('(min-width: 992px)', () => {
      const getScrollDistance = () => {
        const scrollWidth = track.scrollWidth;
        const viewportWidth = viewport.clientWidth;
        return Math.max(0, scrollWidth - viewportWidth + 64);
      };

      const dist = getScrollDistance();
      if (dist <= 0) return;

      gsap.set(track, { x: 0 });

      // Setup quickTo for Velocity Skew on application windows
      const appCards = track.querySelectorAll<HTMLElement>('.app-window');
      appCards.forEach((card) => {
        const quickSkew = gsap.quickTo(card, 'skewX', {
          duration: 0.75,
          ease: 'power3.out',
        });
        skewQuickToSetters.push(quickSkew);
      });

      // Pin the section and scrub horizontal travel strictly inside the right viewport
      gsap.to(track, {
        x: () => -getScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: () => `+=${getScrollDistance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            // Velocity skew between -3.5 and 3.5 deg
            const velocity = self.getVelocity();
            const clampedSkew = Math.max(-3.5, Math.min(3.5, velocity / 320));
            skewQuickToSetters.forEach((setter) => setter(clampedSkew));

            // Sync active project index with scroll progress
            const total = filteredProjects.value.length;
            if (total > 1) {
              const computedIndex = Math.min(
                total - 1,
                Math.max(0, Math.floor(self.progress * total + 0.15)),
              );
              updateActiveProject(computedIndex);
            }
          },
          onScrubComplete: () => {
            skewQuickToSetters.forEach((setter) => setter(0));
          },
        },
      });
    });

    // Mobile / Tablet layout (width < 992px)
    mm.add('(max-width: 991px)', () => {
      const getMobileScrollDistance = () => {
        return Math.max(0, track.scrollWidth - window.innerWidth + 48);
      };

      gsap.to(track, {
        x: () => -getMobileScrollDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          pin: true,
          start: 'top top',
          end: () => `+=${getMobileScrollDistance()}`,
          scrub: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            const total = filteredProjects.value.length;
            if (total > 1) {
              const computedIndex = Math.min(
                total - 1,
                Math.max(0, Math.floor(self.progress * total + 0.15)),
              );
              updateActiveProject(computedIndex);
            }
          },
        },
      });
    });
  }, rootEl.value);

  setupMagneticButtons();
}

async function setFilter(filter: FilterType): Promise<void> {
  if (activeFilter.value === filter) return;
  activeFilter.value = filter;
  activeIndex.value = 0;

  await nextTick();

  if (trackEl.value) {
    gsap.set(trackEl.value, { x: 0 });
  }

  setupHorizontalMotion();
  ScrollTrigger.refresh();
}

/**
 * GSAP Flip Case Study Modal via Teleport
 */
async function openCaseStudy(project: ProjectItem, event: MouseEvent): Promise<void> {
  const targetScreen = (event.currentTarget as HTMLElement).closest('.app-window') as HTMLElement | null;
  if (!targetScreen) return;

  activeSourceEl = targetScreen;
  const state = Flip.getState(targetScreen);

  selectedProject.value = project;
  isModalOpen.value = true;

  const lenis = getLenis();
  if (lenis) lenis.stop();

  await nextTick();

  const modalScreen = modalScreenRef.value;
  if (modalScreen) {
    Flip.from(state, {
      duration: 0.55,
      ease: 'power3.inOut',
      scale: true,
      onComplete: () => {
        gsap.to('.modal-details-pane', { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' });
      },
    });
  }
}

function closeCaseStudy(): void {
  if (!isModalOpen.value || !activeSourceEl) {
    isModalOpen.value = false;
    selectedProject.value = null;
    const lenis = getLenis();
    if (lenis) lenis.start();
    return;
  }

  const modalScreen = modalScreenRef.value;
  if (!modalScreen) {
    isModalOpen.value = false;
    selectedProject.value = null;
    const lenis = getLenis();
    if (lenis) lenis.start();
    return;
  }

  gsap.to('.modal-details-pane, .modal-backdrop-layer', {
    autoAlpha: 0,
    duration: 0.2,
    onComplete: () => {
      Flip.fit(modalScreen, activeSourceEl!, {
        duration: 0.45,
        ease: 'power3.inOut',
        onComplete: () => {
          isModalOpen.value = false;
          selectedProject.value = null;
          activeSourceEl = null;

          const lenis = getLenis();
          if (lenis) lenis.start();
        },
      });
    },
  });
}

function handleKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isModalOpen.value) {
    closeCaseStudy();
  }
}

watch(
  () => props.projects,
  async () => {
    await nextTick();
    setupHorizontalMotion();
    ScrollTrigger.refresh();
  },
  { deep: true },
);

onMounted(() => {
  nextTick(() => {
    setupHorizontalMotion();
    window.addEventListener('keydown', handleKeydown);
  });
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
  magneticCleanups.forEach((cleanup) => cleanup());
  magneticCleanups = [];

  if (mm) {
    mm.revert();
    mm = null;
  }
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  skewQuickToSetters = [];
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
      <!-- Section Top Bar: Title & Status -->
      <header class="section-top-bar">
        <div class="top-title-group">
          <span class="section-mono-tag font-mono">// 03. APPLICATION SHOWCASE</span>
          <h2 id="portfolio-heading" class="section-title">Portfolio de Proyectos</h2>
        </div>

        <!-- Filter Selector (Visible if multiple categories exist) -->
        <div v-if="counts.game > 0" class="filter-bar font-mono" role="tablist" aria-label="Filtrar por categoría">
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
            Web Apps
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
        <div v-else class="project-count-badge font-mono">
          <span class="count-pulse"></span>
          {{ counts.all }} APLICACIONES DESPLEGADAS
        </div>
      </header>

      <!-- Main Layout: Fixed Left Description (NO BOX) + Larger Right Portfolio Carousel (CLIPPED) -->
      <div class="showcase-split-layout">
        <!-- FIXED LEFT NARRATIVE AREA: Pure typography, NO box, changes dynamically with scroll -->
        <aside ref="narrativePanelEl" class="narrative-side" aria-live="polite">
          <div v-if="currentProject" class="narrative-content">
            <div class="meta-indicator font-mono narrative-animate-item">
              <span class="index-num">// 0{{ activeIndex + 1 }} DE 0{{ filteredProjects.length }}</span>
              <span class="type-tag font-mono">
                {{ currentProject.type === 'game' ? 'VIDEOJUEGO' : 'WEB APP' }}
              </span>
            </div>

            <h3 class="narrative-title narrative-animate-item">{{ currentProject.title || currentProject.name }}</h3>
            <p class="narrative-summary narrative-animate-item">{{ currentProject.summary || currentProject.description }}</p>

            <!-- Key Features / Architecture -->
            <div v-if="currentProject.features && currentProject.features.length" class="narrative-features narrative-animate-item">
              <span class="features-label font-mono">Hitos y Arquitectura</span>
              <ul class="features-list">
                <li v-for="(feat, fIdx) in currentProject.features" :key="fIdx">
                  {{ feat }}
                </li>
              </ul>
            </div>

            <!-- Tech Stack Badges -->
            <div v-if="(currentProject.stack && currentProject.stack.length) || (currentProject.tags && currentProject.tags.length)" class="narrative-stack narrative-animate-item font-mono">
              <span
                v-for="tech in (currentProject.stack || currentProject.tags)"
                :key="tech"
                class="stack-pill"
              >
                {{ tech }}
              </span>
            </div>

            <!-- ALWAYS VISIBLE ACTION BUTTONS (With Magnetic quickTo Effect) -->
            <div class="narrative-actions narrative-animate-item font-mono">
              <a
                v-if="currentProject.liveUrl || currentProject.url"
                :href="currentProject.liveUrl || currentProject.url"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-primary-btn"
                :aria-label="currentProject.type === 'game' ? `Jugar ahora a ${currentProject.title || currentProject.name}` : `Visitar aplicación ${currentProject.title || currentProject.name}`"
              >
                <span>{{ currentProject.type === 'game' ? 'Jugar ahora' : 'Visitar aplicación' }}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>

              <a
                v-if="currentProject.repoUrl"
                :href="currentProject.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-secondary-btn"
                :aria-label="`Ver código en GitHub de ${currentProject.title || currentProject.name}`"
              >
                <span>Código</span>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>
        </aside>

        <!-- LARGER RIGHT PORTFOLIO AREA: Strictly overflow clipped so applications NEVER pass under the text -->
        <div ref="carouselViewportEl" class="carousel-viewport">
          <div ref="trackEl" class="apps-track">
            <article
              v-for="(project, index) in filteredProjects"
              :key="project.id || project.title"
              class="app-item-wrapper"
              :class="{ 'is-active-app': index === activeIndex }"
            >
              <!-- Software Application Window Mockup -->
              <div
                class="app-window"
                role="button"
                tabindex="0"
                :aria-label="`Ver detalles expandidos de ${project.title || project.name}`"
                @click="openCaseStudy(project, $event)"
                @keydown.enter="openCaseStudy(project, $event)"
              >
                <!-- Window Chrome Header -->
                <div class="app-window-header">
                  <div class="window-controls" aria-hidden="true">
                    <span class="control-dot dot-close"></span>
                    <span class="control-dot dot-min"></span>
                    <span class="control-dot dot-max"></span>
                  </div>

                  <div class="window-address-bar font-mono">
                    <svg class="lock-icon" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                    <span class="app-url-text">
                      {{ project.liveUrl ? project.liveUrl.replace(/^https?:\/\//, '').replace(/\/$/, '') : `${project.id}.app` }}
                    </span>
                  </div>

                  <span class="app-header-badge font-mono">
                    {{ project.type === 'game' ? 'GAME' : 'WEB' }}
                  </span>
                </div>

                <!-- Window Body Preview -->
                <div class="app-window-body">
                  <img
                    :src="project.previewImageUrl || project.imageUrl"
                    :alt="`Interfaz de la aplicación ${project.title || project.name}`"
                    class="app-preview-img"
                    loading="lazy"
                  />

                  <div class="app-expand-overlay font-mono">
                    <span class="expand-label">Expandir caso de estudio ↗</span>
                  </div>
                </div>

                <!-- Window Status Footer -->
                <div class="app-window-footer font-mono">
                  <span class="status-indicator">
                    <span class="status-pulse"></span>
                    Producción verificada
                  </span>
                  <span class="footer-app-name">{{ project.title || project.name }}</span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>

    <!-- GSAP Flip Expanded Modal Teleported to Body -->
    <Teleport to="body">
      <div
        v-if="isModalOpen && selectedProject"
        class="modal-case-study"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-project-title"
      >
        <div class="modal-backdrop-layer" @click="closeCaseStudy"></div>

        <div class="modal-window">
          <div ref="modalScreenRef" class="modal-screen-display">
            <span class="project-type-badge font-mono">
              {{ selectedProject.type === 'game' ? 'GAME' : 'WEB' }}
            </span>
            <img
              :src="selectedProject.previewImageUrl || selectedProject.imageUrl"
              :alt="`Captura completa de ${selectedProject.title || selectedProject.name}`"
              class="modal-screen-img"
            />
          </div>

          <div class="modal-details-pane">
            <div class="modal-pane-header">
              <div>
                <span class="modal-tag font-mono">// CASO DE ESTUDIO TÉCNICO</span>
                <h3 id="modal-project-title" class="modal-title">{{ selectedProject.title || selectedProject.name }}</h3>
              </div>
              <button
                type="button"
                class="modal-close-btn font-mono"
                aria-label="Cerrar detalles del proyecto"
                @click="closeCaseStudy"
              >
                ✕ ESC
              </button>
            </div>

            <p class="modal-summary">{{ selectedProject.summary || selectedProject.description }}</p>

            <div v-if="selectedProject.features && selectedProject.features.length" class="modal-features-section">
              <h4 class="modal-subtitle font-mono">Hitos y Arquitectura</h4>
              <ul class="modal-features-list">
                <li v-for="(feat, fIdx) in selectedProject.features" :key="fIdx">
                  {{ feat }}
                </li>
              </ul>
            </div>

            <div v-if="(selectedProject.stack && selectedProject.stack.length) || (selectedProject.tags && selectedProject.tags.length)" class="modal-stack-section">
              <h4 class="modal-subtitle font-mono">Stack Tecnológico</h4>
              <div class="modal-stack-pills font-mono">
                <span
                  v-for="tech in (selectedProject.stack || selectedProject.tags)"
                  :key="tech"
                  class="stack-pill"
                >
                  {{ tech }}
                </span>
              </div>
            </div>

            <div class="modal-actions font-mono">
              <a
                v-if="selectedProject.liveUrl || selectedProject.url"
                :href="selectedProject.liveUrl || selectedProject.url"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-primary-btn"
              >
                <span>Visitar aplicación en vivo</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>

              <a
                v-if="selectedProject.repoUrl"
                :href="selectedProject.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="cta-secondary-btn"
              >
                <span>Ver repositorio GitHub</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
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
  padding: 40px 0;
  box-sizing: border-box;
}

/* Top Bar: Title & Status */
.section-top-bar {
  max-width: 1380px;
  width: 100%;
  margin: 0 auto;
  padding: 0 40px 24px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
  flex-wrap: wrap;
  z-index: 5;
  box-sizing: border-box;
}

.top-title-group {
  flex: 1;
  min-width: 260px;
}

.section-mono-tag {
  display: inline-block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.12em;
  margin-bottom: 8px;
  opacity: 0.9;
}

.section-title {
  font-family: var(--font-display);
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.03em;
}

.project-count-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(38, 38, 50, 0.7);
  border: 1px solid var(--color-border);
  padding: 6px 14px;
  border-radius: 2px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.08em;
}

.count-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #76946a;
  box-shadow: 0 0 6px #76946a;
}

/* Category Filter Bar */
.filter-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  background: rgba(38, 38, 50, 0.75);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
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
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease, background-color 0.2s ease, border-color 0.2s ease;
  touch-action: manipulation;
}

.filter-btn:hover {
  color: var(--color-text);
  background: rgba(220, 215, 186, 0.06);
}

.filter-btn.is-active {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.filter-count {
  display: inline-block;
  font-size: 0.72rem;
  padding: 1px 5px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.25);
  line-height: 1.2;
}

.filter-btn.is-active .filter-count {
  background: rgba(31, 31, 40, 0.35);
  color: var(--color-bg);
}

/* MAIN SPLIT LAYOUT: Fixed Left Narrative + Larger Right Carousel */
.showcase-split-layout {
  display: grid;
  grid-template-columns: 360px 1fr; /* Larger right area for portfolios */
  gap: 48px;
  align-items: center;
  width: 100%;
  max-width: 1380px;
  margin: 0 auto;
  padding: 0 40px;
  box-sizing: border-box;
}

/* FIXED LEFT NARRATIVE AREA: Pure typography, NO box, NO border, NO background */
.narrative-side {
  position: relative;
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  z-index: 5;
}

.narrative-content {
  display: flex;
  flex-direction: column;
}

.meta-indicator {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.index-num {
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.08em;
}

.type-tag {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--color-text-secondary);
  background: rgba(220, 215, 186, 0.08);
  border: 1px solid var(--color-border);
  padding: 2px 8px;
  border-radius: 2px;
  letter-spacing: 0.06em;
}

.narrative-title {
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px;
  letter-spacing: -0.02em;
  line-height: 1.25;
}

.narrative-summary {
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0 0 20px;
}

/* Features List */
.narrative-features {
  margin-bottom: 20px;
  padding-left: 14px;
  border-left: 2px solid var(--color-accent);
}

.features-label {
  display: block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--color-accent);
  letter-spacing: 0.06em;
  margin-bottom: 8px;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.features-list li {
  position: relative;
  font-size: 0.86rem;
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

/* Stack Pills */
.narrative-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 24px;
}

.stack-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 7px;
  background: rgba(220, 215, 186, 0.06);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
}

/* Actions in Narrative Side */
.narrative-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding-top: 16px;
  border-top: 1px solid var(--color-border);
}

.cta-primary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--color-accent);
  color: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: 2px;
  font-size: 0.84rem;
  font-weight: 700;
  text-decoration: none;
  transition: background-color 0.2s ease;
  touch-action: manipulation;
  will-change: transform;
}

.cta-primary-btn:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
}

.cta-secondary-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 14px;
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  transition: color 0.2s ease, border-color 0.2s ease;
  will-change: transform;
}

.cta-secondary-btn:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
}

/* LARGER RIGHT PORTFOLIO AREA: STRICTLY CLIPPED SO ITEMS NEVER PASS UNDER THE TEXT */
.carousel-viewport {
  position: relative;
  width: 100%;
  overflow: hidden; /* Clips cards completely so they cannot cross into the left text */
  padding: 16px 0;
}

.apps-track {
  display: flex;
  align-items: center;
  gap: 64px;
  padding: 10px 20px 10px 4px;
  width: max-content;
  will-change: transform;
}

.app-item-wrapper {
  position: relative;
  width: 580px;
  max-width: 70vw;
  flex-shrink: 0;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.35s ease;
  opacity: 0.65;
}

.app-item-wrapper.is-active-app {
  opacity: 1;
  transform: scale(1.02);
}

/* Software Application Window Mockup */
.app-window {
  position: relative;
  width: 100%;
  background: #181720;
  border: 1px solid var(--color-border);
  border-radius: 6px;
  box-shadow: 0 24px 50px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  cursor: pointer;
  transform-origin: center bottom;
  will-change: transform;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.app-item-wrapper.is-active-app .app-window {
  border-color: var(--color-border-hover);
  box-shadow: 0 30px 60px rgba(0, 0, 0, 0.7), 0 0 24px rgba(230, 195, 132, 0.15);
}

/* Window Chrome Header */
.app-window-header {
  height: 38px;
  background: #24232e;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  gap: 12px;
}

.window-controls {
  display: flex;
  align-items: center;
  gap: 7px;
}

.control-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.dot-close { background: #e46876; opacity: 0.85; }
.dot-min { background: #e6c384; opacity: 0.85; }
.dot-max { background: #76946a; opacity: 0.85; }

.window-address-bar {
  flex: 1;
  max-width: 320px;
  height: 24px;
  background: rgba(18, 17, 24, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 10px;
  color: var(--color-text-secondary);
  font-size: 0.72rem;
  overflow: hidden;
}

.lock-icon {
  opacity: 0.7;
  color: var(--color-accent);
  flex-shrink: 0;
}

.app-url-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-header-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 2px;
  letter-spacing: 0.06em;
  background: rgba(230, 195, 132, 0.18);
  color: var(--color-accent);
}

/* Window Body */
.app-window-body {
  position: relative;
  width: 100%;
  height: 330px;
  background: #0d0c10;
  overflow: hidden;
}

.app-preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.app-expand-overlay {
  position: absolute;
  inset: 0;
  background: rgba(20, 19, 28, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.app-window:hover .app-expand-overlay,
.app-window:focus-visible .app-expand-overlay {
  opacity: 1;
}

.expand-label {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--color-accent);
  background: rgba(30, 29, 38, 0.9);
  border: 1px solid var(--color-accent);
  padding: 6px 14px;
  border-radius: 2px;
}

/* Status Bar */
.app-window-footer {
  height: 28px;
  background: #1f1e28;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  font-size: 0.7rem;
  color: var(--color-text-secondary);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
}

.status-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #76946a;
  box-shadow: 0 0 6px #76946a;
}

.footer-app-name {
  opacity: 0.8;
}

/* Teleported Case Study Modal */
.modal-case-study {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
}

.modal-backdrop-layer {
  position: absolute;
  inset: 0;
  background: rgba(18, 18, 24, 0.88);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}

.modal-window {
  position: relative;
  width: 100%;
  max-width: 1060px;
  max-height: 90vh;
  background: #1c1c24;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  box-shadow: 0 32px 70px rgba(0, 0, 0, 0.7);
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  overflow: hidden;
  z-index: 2;
}

.modal-screen-display {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 420px;
  background: #0d0c10;
  overflow: hidden;
}

.modal-screen-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

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
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.45);
  background: var(--color-accent);
  color: var(--color-bg);
}

.modal-details-pane {
  padding: 36px 32px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.modal-pane-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 20px;
  gap: 16px;
}

.modal-tag {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.1em;
  margin-bottom: 6px;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
  letter-spacing: -0.02em;
}

.modal-close-btn {
  background: rgba(220, 215, 186, 0.08);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
  border-radius: 2px;
  padding: 6px 12px;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.2s, border-color 0.2s, background-color 0.2s;
}

.modal-close-btn:hover {
  color: var(--color-text);
  border-color: var(--color-accent);
  background: rgba(230, 195, 132, 0.1);
}

.modal-summary {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0 0 24px;
}

.modal-subtitle {
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-accent);
  margin: 0 0 10px;
}

.modal-features-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.modal-features-list li {
  position: relative;
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--color-text);
  padding-left: 18px;
}

.modal-features-list li::before {
  content: '▸';
  position: absolute;
  left: 0;
  color: var(--color-accent);
  font-weight: bold;
}

.modal-stack-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 28px;
}

.modal-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid var(--color-border);
}

/* RESPONSIVE LAYOUTS */
@media (max-width: 991px) {
  .showcase-split-layout {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 0 20px;
  }

  .narrative-side {
    width: 100%;
  }

  .carousel-viewport {
    overflow: visible;
  }

  .apps-track {
    gap: 40px;
    padding: 10px 20px;
  }

  .app-item-wrapper {
    width: 420px;
  }

  .app-window-body {
    height: 240px;
  }
}

@media (max-width: 860px) {
  .modal-window {
    grid-template-columns: 1fr;
    max-height: 92vh;
  }

  .modal-screen-display {
    min-height: 240px;
  }

  .modal-details-pane {
    padding: 24px 20px;
  }
}
</style>
