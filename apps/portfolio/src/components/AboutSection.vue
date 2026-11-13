<script setup lang="ts">
import { onMounted } from 'vue';
import gsap from 'gsap';
import type { Profile } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';

const props = defineProps<{
  profile: Profile;
  theme: Theme;
}>();

onMounted(() => {
  if (prefersReducedMotion()) return;

  gsap.from('.about-card', {
    y: 30,
    opacity: 0,
    duration: 0.8,
    stagger: 0.15,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 80%',
    },
  });
});
</script>

<template>
  <section id="about" class="about-section" aria-labelledby="about-title">
    <div class="container">
      <div class="section-header">
        <h2 id="about-title" class="section-title">Sobre mí</h2>
        <p class="section-subtitle">Arquitectura de software con foco en robustez, claridad y rendimiento</p>
      </div>

      <div class="about-grid">
        <div class="about-card main-bio">
          <h3 class="card-title">Trayectoria & Enfoque</h3>
          <p class="bio-text">
            {{ profile.bio }}
          </p>
          <div class="pillars">
            <div class="pillar-tag">Clean Architecture</div>
            <div class="pillar-tag">Hexagonal & DDD</div>
            <div class="pillar-tag">Design Systems</div>
            <div class="pillar-tag">Performance Web</div>
          </div>
        </div>

        <div class="about-card side-info">
          <div class="info-item">
            <span class="info-label">Experiencia</span>
            <span class="info-value">8+ años construyendo software y aplicaciones web</span>
          </div>

          <div class="info-item" v-if="profile.location">
            <span class="info-label">Ubicación</span>
            <span class="info-value">{{ profile.location }}</span>
          </div>

          <div class="info-item">
            <span class="info-label">Disponibilidad</span>
            <span class="info-value status-badge">
              <span class="pulse-dot"></span>
              Disponible para consultoría y proyectos clave
            </span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  padding: 100px 0;
  background: var(--color-bg);
  position: relative;
}

.container {
  max-width: 900px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.section-header {
  text-align: center;
  margin-bottom: 48px;
}

.section-title {
  font-size: clamp(2rem, 4vw, 2.75rem);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 12px;
  letter-spacing: -0.04em;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.about-grid {
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 24px;
  justify-content: center;
}

.about-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  padding: 32px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 16px;
  letter-spacing: -0.02em;
}

.bio-text {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text);
  margin: 0 0 24px;
  opacity: 0.95;
}

.pillars {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
}

.pillar-tag {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 4px 10px;
  background: rgba(230, 195, 132, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(230, 195, 132, 0.25);
  border-radius: 2px;
}

.side-info {
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  gap: 20px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-label {
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.info-value {
  font-size: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--color-accent);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #76946A;
  border-radius: 50%;
  display: inline-block;
  box-shadow: 0 0 0 0 rgba(118, 148, 106, 0.7);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(118, 148, 106, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 6px rgba(118, 148, 106, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(118, 148, 106, 0);
  }
}

@media (max-width: 768px) {
  .about-grid {
    grid-template-columns: 1fr;
  }
  .about-card {
    padding: 24px;
  }
}
</style>
