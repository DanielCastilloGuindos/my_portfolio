<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import gsap from 'gsap';
import type { Profile, Experience, Education, Project, ContactInfo, SocialLink, NavLink, WorkExperience, PortfolioProject } from '@portfolio/core';
import { getTheme, type Theme } from '../themes/index';
import { initSmoothScroll } from '../lib/smooth-scroll';
import ThemeApplier from '../components/ThemeApplier.vue';
import HeaderNav from '../components/HeaderNav.vue';
import HeroSection from '../components/HeroSection.vue';
import AboutSection from '../components/AboutSection.vue';
import TimelineExperience from '../components/TimelineExperience.vue';
import AchievementFrame from '../components/AchievementFrame.vue';
import ProjectsSection from '../components/ProjectsSection.vue';
import ContactSection from '../components/ContactSection.vue';
import FooterNav from '../components/FooterNav.vue';
import { prefersReducedMotion } from '../lib/format';

const props = defineProps<{
  profileId?: string;
  themeId?: string;
}>();

const currentThemeId = ref(props.themeId ?? 'default');
const theme = computed<Theme>(() => getTheme(currentThemeId.value));

const profile = ref<Profile | null>(null);
const experiences = ref<(Experience & WorkExperience)[]>([]);
const education = ref<Education[]>([]);
const projects = ref<(Project & PortfolioProject)[]>([]);
const contactInfo = ref<ContactInfo | null>(null);
const socialLinks = ref<SocialLink[]>([]);
const navLinks = ref<NavLink[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);

let syncChannel: BroadcastChannel | null = null;
let smoothScrollCleanup: (() => void) | null = null;
let entranceContext: gsap.Context | null = null;
let motionMediaQuery: MediaQueryList | null = null;
const STATIC_PATH = '/data/portfolio.json';

function applyPortfolioData(data: Record<string, any>): void {
  profile.value = (data.profile as Profile) ?? null;
  if (profile.value?.themeId) {
    currentThemeId.value = profile.value.themeId;
  }

  const rawExp = (data.experiences as any[] ?? []);
  experiences.value = rawExp.map((e) => ({
    ...e,
    role: e.role ?? e.position ?? '',
    position: e.position ?? e.role ?? '',
    period: e.period ?? '',
    highlights: Array.isArray(e.highlights) ? e.highlights : (e.description ? [e.description] : []),
    stack: Array.isArray(e.stack) ? e.stack : [],
    backgroundVideoUrl: e.backgroundVideoUrl ?? e.videoUrl ?? '',
    videoUrl: e.videoUrl ?? e.backgroundVideoUrl ?? '',
    companyUrl: e.companyUrl ?? e.websiteUrl ?? '',
    startDate: e.startDate ? new Date(e.startDate) : new Date(),
    endDate: e.endDate ? new Date(e.endDate) : undefined,
  })).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const rawEdu = (data.education as any[] ?? []);
  education.value = rawEdu.map((e) => ({
    ...e,
    startDate: new Date(e.startDate),
    endDate: e.endDate ? new Date(e.endDate) : undefined,
  })).sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());

  const rawProjects = (data.projects as any[] ?? []);
  projects.value = rawProjects.map((p) => ({
    ...p,
    title: p.title ?? p.name ?? '',
    name: p.name ?? p.title ?? '',
    type: (p.type === 'game' ? 'game' : 'web') as 'web' | 'game',
    summary: p.summary ?? p.description ?? '',
    description: p.description ?? p.summary ?? '',
    features: Array.isArray(p.features) ? p.features : [],
    stack: Array.isArray(p.stack) ? p.stack : (Array.isArray(p.tags) ? p.tags : []),
    tags: Array.isArray(p.tags) ? p.tags : (Array.isArray(p.stack) ? p.stack : []),
    previewImageUrl: p.previewImageUrl ?? p.imageUrl ?? '',
    imageUrl: p.imageUrl ?? p.previewImageUrl ?? '',
    liveUrl: p.liveUrl ?? p.url ?? '',
    url: p.url ?? p.liveUrl ?? '',
    repoUrl: p.repoUrl ?? '',
  }));

  socialLinks.value = (data.socialLinks as SocialLink[] ?? []);
  contactInfo.value = (data.contactInfo as ContactInfo | null) ?? null;
  navLinks.value = (data.profile?.navLinks as NavLink[] ?? data.navLinks as NavLink[] ?? []);
}

async function loadPortfolio(): Promise<void> {
  try {
    // 1. Fetch the canonical data from json first with cache busting
    let serverData: Record<string, any> | null = null;
    try {
      const response = await fetch(`${STATIC_PATH}?t=${Date.now()}`);
      if (response.ok) {
        serverData = (await response.json()) as Record<string, any>;
      }
    } catch {
      // Server fetch failed, use localData fallback
    }

    // 2. Check for local storage only as an offline fallback
    let localData: Record<string, any> | null = null;
    try {
      const stored = localStorage.getItem('portfolio-manager-draft') || localStorage.getItem('portfolio_data');
      if (stored) {
        localData = JSON.parse(stored);
      }
    } catch {
      // Local storage may be restricted or empty
    }

    // Canonical priority: if serverData is available, prefer it unless local draft is strictly newer
    let merged = serverData || localData;
    if (serverData && localData) {
      const serverTime = serverData.profile?.updatedAt ? new Date(serverData.profile.updatedAt).getTime() : 0;
      const localTime = localData.profile?.updatedAt ? new Date(localData.profile.updatedAt).getTime() : 0;
      if (localTime > serverTime) {
        merged = localData;
      } else {
        merged = serverData;
        try {
          localStorage.setItem('portfolio-manager-draft', JSON.stringify(serverData));
        } catch {}
      }
    }

    if (!merged) {
      throw new Error('No se pudieron cargar los datos del portfolio.');
    }

    applyPortfolioData(merged);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Error desconocido al cargar';
    console.error('Failed to load portfolio:', err);
  } finally {
    isLoading.value = false;
  }
}

/**
 * Page-level GSAP entrance animation. Honors prefers-reduced-motion.
 */
function animateEntrance(): void {
  if (prefersReducedMotion()) return;

  const sections = document.querySelectorAll<HTMLElement>('.portfolio-section');
  if (!sections.length) return;

  entranceContext?.revert();
  entranceContext = gsap.context(() => {
    gsap.from(sections, {
      y: 30,
      opacity: 0,
      duration: 0.7,
      stagger: 0.2,
      ease: 'power3.out',
      delay: 0.2,
    });
  });
}

function syncMotionPreference(): void {
  if (prefersReducedMotion()) {
    entranceContext?.revert();
    entranceContext = null;
  }
  smoothScrollCleanup?.();
  smoothScrollCleanup = initSmoothScroll().cleanup;
}

function handleStorageUpdate(event: StorageEvent): void {
  if (event.key === 'portfolio-manager-draft' || event.key === 'portfolio_data') {
    if (event.newValue) {
      try {
        const updated = JSON.parse(event.newValue);
        applyPortfolioData(updated);
      } catch {
        // Ignore parse error
      }
    }
  }
}

onMounted(() => {
  smoothScrollCleanup = initSmoothScroll().cleanup;
  motionMediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  motionMediaQuery.addEventListener('change', syncMotionPreference);

  loadPortfolio().then(async () => {
    // Child sections render only after the data-driven branch is mounted.
    await nextTick();
    animateEntrance();
  });

  // Listen to cross-tab updates from apps/manager
  window.addEventListener('storage', handleStorageUpdate);

  try {
    if (typeof BroadcastChannel !== 'undefined') {
      syncChannel = new BroadcastChannel('portfolio-sync');
      syncChannel.onmessage = (event) => {
        if (event.data && typeof event.data === 'object') {
          applyPortfolioData(event.data);
        }
      };
    }
  } catch {
    // BroadcastChannel unsupported
  }
});

onUnmounted(() => {
  motionMediaQuery?.removeEventListener('change', syncMotionPreference);
  motionMediaQuery = null;
  entranceContext?.revert();
  entranceContext = null;
  if (smoothScrollCleanup) {
    smoothScrollCleanup();
    smoothScrollCleanup = null;
  }
  window.removeEventListener('storage', handleStorageUpdate);
  if (syncChannel) {
    syncChannel.close();
    syncChannel = null;
  }
});
</script>

<template>
  <ThemeApplier :theme="theme" />

  <div v-if="isLoading" class="loading-state">
    <p>Cargando portafolio…</p>
  </div>

  <div v-else-if="error" class="error-state">
    <p>Error: {{ error }}</p>
    <button @click="loadPortfolio" class="retry-btn">Reintentar</button>
  </div>

  <div v-else class="portfolio-app">
    <!-- Header: Hidden within Hero, appears in subsequent sections -->
    <HeaderNav
      :title="profile?.headerTitle || profile?.name"
      :logo-url="profile?.headerLogoUrl"
      :cv-url="profile?.cvUrl"
      :custom-links="navLinks"
    />

    <!-- Main landmark containing all sections in requested order -->
    <main id="main">
      <!-- 1. Hero: Greeting + Drawing + Direct Actions -->
      <HeroSection
        v-if="profile"
        :profile="profile"
        :theme="theme"
      />

      <!-- 2. Sobre mí (About Me) -->
      <AboutSection
        v-if="profile"
        :profile="profile"
        :theme="theme"
      />

      <!-- 3. Proyectos (Anteriormente Portfolio) -->
      <ProjectsSection
        :projects="projects"
        :theme="theme"
      />

      <!-- 4. Carrera profesional (Anteriormente Experiencia laboral) -->
      <TimelineExperience
        v-if="experiences.length"
        :experiences="experiences"
        :theme="theme"
      />

      <!-- 5. Carrera estudiantil (Oculto temporalmente) -->
      <!--
      <AchievementFrame
        v-if="education.length"
        :education="education"
        :theme="theme"
      />
      -->

      <!-- 6. Contacto -->
      <ContactSection
        :contact-info="contactInfo"
        :profile="profile ?? ({} as Profile)"
        :theme="theme"
      />
    </main>

    <!-- Footer with Doctor Who TARDIS Time Machine Easter Egg & Social Links -->
    <FooterNav
      :projects="projects"
      :theme="theme"
      :profile="profile"
      :social-links="socialLinks"
    />
  </div>
</template>

<style scoped>
.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--color-text-secondary);
}

.error-state .retry-btn {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background: var(--color-accent);
  color: var(--color-bg);
  border: 1px solid var(--color-accent);
  border-radius: 2px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  touch-action: manipulation;
}

.error-state .retry-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.error-state .retry-btn:hover {
  background: var(--color-accent-hover);
}

.portfolio-app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: var(--color-bg);
}

#main {
  display: flex;
  flex-direction: column;
  width: 100%;
}
</style>
