<script setup lang="ts">
import { onMounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Profile } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';

gsap.registerPlugin(ScrollTrigger);

const props = defineProps<{
  profile: Profile;
  theme: Theme;
}>();

onMounted(() => {
  if (prefersReducedMotion()) return;

  gsap.from('.about-bento-card', {
    y: 35,
    opacity: 0,
    duration: 0.75,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: {
      trigger: '#about',
      start: 'top 80%',
    },
  });
});
</script>

<template>
  <section id="about" class="about-section portfolio-section" aria-labelledby="about-title">
    <div class="container">
      <header class="section-header">
        <span class="section-mono-tag font-mono">// 01. FILOSOFÍA & ENFOQUE TÉCNICO</span>
        <h2 id="about-title" class="section-title">Sobre mí</h2>
        <p class="section-subtitle">
          Arquitectura frontend, robustez en producción y diseño de experiencias digitales de alto rendimiento
        </p>
      </header>

      <div class="about-bento-grid">
        <!-- Main Narrative Card: Dominant storytelling & pillars -->
        <article class="about-bento-card card-main">
          <div class="card-tag font-mono">
            <span class="tag-dot"></span>
            <span>CRAFTSMANSHIP & ARQUITECTURA</span>
          </div>

          <h3 class="narrative-headline">
            Ingeniería de software con foco en mantenibilidad, tipado riguroso y arquitectura limpia.
          </h3>

          <p class="narrative-body">
            {{ profile.bio }}
          </p>

          <p class="narrative-subbody">
            Mi enfoque prioriza la separación clara de responsabilidades, la previsibilidad de los estados globales y la solidez ante flujos críticos de alta concurrencia —como autenticación federada SSO, pasarelas de pago y tracking en tiempo real.
          </p>

          <div class="pillars-container">
            <span class="pillars-label font-mono">Pilares Técnicos:</span>
            <div class="pillars-list font-mono">
              <span class="pillar-pill">Hexagonal Architecture</span>
              <span class="pillar-pill">Vue 3 & TypeScript</span>
              <span class="pillar-pill">Vitest & Testing</span>
              <span class="pillar-pill">Clean Code & DDD</span>
              <span class="pillar-pill">Web Performance</span>
              <span class="pillar-pill">Observabilidad (Kibana / Grafana)</span>
            </div>
          </div>
        </article>

        <!-- Right Side Bento Column -->
        <div class="bento-side-column">
          <!-- Metric Card: Enterprise Experience -->
          <article class="about-bento-card card-stat">
            <div class="stat-number font-mono">
              <span>+5</span><span class="stat-plus">años</span>
            </div>
            <h4 class="stat-title">Producción a Gran Escala</h4>
            <p class="stat-desc">
              Desarrollando soluciones para entornos de alto impacto y misión crítica en compañías líderes como El Corte Inglés y consultoría internacional en NEORIS.
            </p>
          </article>

          <!-- Status & Environment Card -->
          <article class="about-bento-card card-status">
            <div class="status-indicator-row font-mono">
              <span class="pulse-dot"></span>
              <span class="status-text">DISPONIBLE PARA PROYECTOS CLAVE</span>
            </div>
            <div class="location-row font-mono">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span>{{ profile.location || 'Madrid, España' }} · Modalidad Remoto / Híbrido</span>
            </div>
            <div class="quote-box">
              <p class="quote-text font-mono">
                «El código limpio no es un fin en sí mismo; es el medio para que un equipo avance rápido y sin fricciones.»
              </p>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.about-section {
  position: relative;
  width: 100%;
  padding: 110px 0 120px;
  background: var(--color-bg);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  box-sizing: border-box;
}

.section-header {
  text-align: center;
  margin-bottom: 56px;
}

.section-mono-tag {
  display: inline-block;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-accent);
  letter-spacing: 0.12em;
  margin-bottom: 12px;
  opacity: 0.9;
}

.section-title {
  font-family: var(--font-display, 'Bricolage Grotesque', sans-serif);
  font-size: clamp(2.2rem, 4vw, 2.85rem);
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 14px;
  letter-spacing: -0.03em;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  max-width: 620px;
  margin: 0 auto;
  line-height: 1.55;
}

/* Bento Grid */
.about-bento-grid {
  display: grid;
  grid-template-columns: 1.35fr 1fr;
  gap: 28px;
  align-items: stretch;
}

.bento-side-column {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.about-bento-card {
  position: relative;
  background: rgba(38, 38, 50, 0.72);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  padding: 36px 34px;
  box-sizing: border-box;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
}

.about-bento-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}

/* Card Main */
.card-main {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-tag {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 0.76rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.08em;
  margin-bottom: 20px;
}

.tag-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
}

.narrative-headline {
  font-family: var(--font-display, 'Bricolage Grotesque', sans-serif);
  font-size: 1.4rem;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 18px;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.narrative-body {
  font-size: 1rem;
  line-height: 1.7;
  color: var(--color-text-secondary);
  margin: 0 0 14px;
}

.narrative-subbody {
  font-size: 0.95rem;
  line-height: 1.65;
  color: var(--color-text-secondary);
  margin: 0 0 28px;
  opacity: 0.9;
}

.pillars-container {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid rgba(54, 54, 70, 0.45);
}

.pillars-label {
  display: block;
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 12px;
}

.pillars-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.pillar-pill {
  font-size: 0.76rem;
  font-weight: 600;
  padding: 5px 11px;
  background: rgba(230, 195, 132, 0.08);
  color: var(--color-accent);
  border: 1px solid rgba(230, 195, 132, 0.22);
  border-radius: 2px;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}

.pillar-pill:hover {
  background: rgba(230, 195, 132, 0.16);
  border-color: var(--color-accent);
}

/* Card Stat */
.card-stat {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--color-accent);
  line-height: 1;
  letter-spacing: -0.03em;
  margin-bottom: 8px;
}

.stat-plus {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-left: 6px;
}

.stat-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 10px;
  letter-spacing: -0.01em;
}

.stat-desc {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Card Status */
.card-status {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-indicator-row {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.78rem;
  font-weight: 700;
  color: #76946a;
  letter-spacing: 0.06em;
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: #76946a;
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
    box-shadow: 0 0 0 8px rgba(118, 148, 106, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(118, 148, 106, 0);
  }
}

.location-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.85rem;
  color: var(--color-text-secondary);
}

.location-row svg {
  color: var(--color-accent);
  flex-shrink: 0;
}

.quote-box {
  background: rgba(220, 215, 186, 0.04);
  border-left: 2px solid var(--color-accent);
  padding: 10px 14px;
  margin-top: 4px;
}

.quote-text {
  font-size: 0.82rem;
  line-height: 1.5;
  color: var(--color-text-secondary);
  font-style: italic;
  margin: 0;
}

@media (max-width: 960px) {
  .about-bento-grid {
    grid-template-columns: 1fr;
  }

  .about-bento-card {
    padding: 28px 24px;
  }
}
</style>