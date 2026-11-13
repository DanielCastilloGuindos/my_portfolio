<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, ref } from 'vue';
import type { Profile, SocialLink } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { setupMagnetic } from '../lib/magnetic';
import PortfolioMeDrawing, { type DrawingExpression } from './PortfolioMeDrawing.vue';

const props = defineProps<{
  profile: Profile;
  theme: Theme;
}>();

const emit = defineEmits<{
  (e: 'cv-download'): void;
}>();

const rootEl = ref<HTMLElement | null>(null);
const activeExpression = ref<DrawingExpression>('default');
let magneticCleanups: Array<() => void> = [];

const socialLinks: SocialLink[] = (props.profile.socialLinks as SocialLink[] | undefined) ?? [];

function openCv(): void {
  emit('cv-download');
}

function openWhatsApp(): void {
  const number = props.profile.whatsapp || props.profile.phone;
  if (!number) return;
  const clean = number.replace(/\s/g, '');
  window.open(`https://wa.me/${clean}`, '_blank', 'noopener,noreferrer');
}

onMounted(() => {
  nextTick(() => {
    const buttons = rootEl.value?.querySelectorAll<HTMLElement>('.btn') ?? [];
    buttons.forEach((btn) => {
      magneticCleanups.push(setupMagnetic(btn, { strength: 0.28, textStrength: 0.15 }));
    });
  });
});

onUnmounted(() => {
  magneticCleanups.forEach((cleanup) => cleanup());
  magneticCleanups = [];
});
</script>

<template>
  <section id="hero" ref="rootEl" class="hero" aria-labelledby="hero-title">
    <div class="hero-grid">
      <!-- Left: illustrated portrait from me.html -->
      <div class="monigote-col">
        <PortfolioMeDrawing :scale="1.8" :expression="activeExpression" />
      </div>

      <!-- Right: name, title, bio, actions -->
      <div class="hero-content">
        <h1 id="hero-title" class="hero-name">{{ profile.name }}</h1>
        <h2 class="hero-title" :style="{ color: theme.cssVariables['--color-accent'] }">
          {{ profile.title }}
        </h2>
        <p class="hero-bio">{{ profile.bio }}</p>

        <div class="hero-actions">
          <a
            v-if="profile.cvUrl"
            :href="profile.cvUrl"
            download="CV_Daniel_Castillo_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            @click="openCv"
            @mouseenter="activeExpression = 'cv-hover'"
            @mouseleave="activeExpression = 'default'"
            class="btn btn-cv font-mono"
            aria-label="Descargar CV de Daniel Castillo"
          >
            <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span class="btn-label">Descargar CV</span>
          </a>

          <a
            v-if="profile.whatsapp || profile.phone"
            :href="`https://wa.me/${(profile.whatsapp || profile.phone).replace(/\s/g, '')}`"
            target="_blank"
            rel="noopener noreferrer"
            @click="openWhatsApp"
            @mouseenter="activeExpression = 'whatsapp-hover'"
            @mouseleave="activeExpression = 'default'"
            class="btn btn-whatsapp font-mono"
            aria-label="Contactar por WhatsApp"
          >
            <svg class="btn-icon" width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.83.81 2.788.81 3.181 0 5.768-2.587 5.769-5.766.001-3.182-2.586-5.796-5.767-5.796zm3.385 8.212c-.143.402-.833.771-1.157.818-.323.048-.737.067-2.392-.619-1.996-.827-3.266-2.859-3.366-2.993-.1-.133-.807-1.074-.807-2.049 0-.975.508-1.455.688-1.654.181-.199.395-.249.528-.249.133 0 .266.002.381.008.122.006.284-.046.444.338.165.396.564 1.375.614 1.476.05.101.083.219.016.353-.067.133-.1.217-.199.333-.1.116-.21.26-.3.349-.1.1-.205.209-.089.409.116.2.518.855 1.111 1.383.766.682 1.411.894 1.611.994.2.1.317.088.434-.047.117-.134.5-.584.633-.784.133-.2.267-.167.45-.1.183.067 1.161.548 1.361.648.2.1.333.15.383.234.05.084.05.485-.093.887z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.306C8.441 21.522 10.165 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.178-.501-4.464-1.365l-.32-.213-2.964.777.791-2.89-.228-.363C3.896 14.825 3.35 13.454 3.35 12c0-4.77 3.88-8.65 8.65-8.65 4.77 0 8.65 3.88 8.65 8.65 0 4.77-3.88 8.65-8.65 8.65z"/>
            </svg>
            <span class="btn-label">WhatsApp</span>
          </a>

          <button
            v-for="link in socialLinks"
            :key="link.id"
            class="btn btn-social font-mono"
            :aria-label="`Perfil de ${link.platform}`"
            @click="window.open(link.url, '_blank', 'noopener,noreferrer')"
          >
            <span class="btn-label">{{ link.platform }}</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 120px 0;
  background: var(--color-bg);
}

.hero-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;
  max-width: 1024px;
  width: 100%;
  margin: 0 auto;
}

.monigote-col {
  display: flex;
  justify-content: center;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.hero-name {
  margin: 0;
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 600;
  letter-spacing: -0.04em;
  color: var(--color-text);
  line-height: 0.92;
}

.hero-title {
  margin: 0;
  font-size: clamp(1.25rem, 3vw, 1.75rem);
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.hero-bio {
  margin: 0;
  font-size: 1.125rem;
  color: var(--color-text-secondary);
  line-height: 1.6;
  max-width: 460px;
  /* Maximum 2 lines, ~75 chars each */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hero-actions {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
  margin-top: 16px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 1rem;
  font-weight: 600;
  border-radius: var(--radius-md, 2px);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  cursor: pointer;
  text-decoration: none;
  touch-action: manipulation;
  transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
}

.btn-icon {
  flex-shrink: 0;
}

.btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.btn:hover {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.btn:active {
  transform: none;
}

.btn-cv {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.btn-cv:hover {
  background: var(--color-accent-hover);
}

.btn-whatsapp {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

.btn-whatsapp:hover {
  background: var(--color-accent-hover);
}

.btn-social {
  padding: 12px 20px;
  font-size: 0.95rem;
}

/* Responsive: stack on mobile */
@media (max-width: 768px) {
  .hero-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .monigote-col {
    order: 2;
  }

  .hero-actions {
    justify-content: center;
  }

  .btn {
    flex: 1 1 140px;
    justify-content: center;
  }
}
</style>
