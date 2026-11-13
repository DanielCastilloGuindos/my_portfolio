<script setup lang="ts">
import { onMounted } from 'vue';
import gsap from 'gsap';
import type { Education } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { formatDateRange, prefersReducedMotion } from '../lib/format';

const props = defineProps<{
  education: Education[];
  theme: Theme;
}>();

onMounted(() => {
  if (prefersReducedMotion() || !props.education.length) return;

  gsap.from('.achievement-card', {
    y: 32,
    opacity: 0,
    duration: 0.9,
    stagger: 0.12,
    ease: 'power3.out',
  });
});
</script>

<template>
  <section id="estudios" class="achievements" aria-label="Estudios y logros">
    <h2 class="section-title" id="estudios">Estudios</h2>

    <div class="achievement-grid">
      <div
        v-for="edu in education"
        :key="edu.id"
        class="achievement-card"
        :class="edu.achievement ? 'has-achievement' : ''"
      >
        <div class="card-frame" />

        <div class="card-body">
          <div class="card-header">
            <h3 class="card-institution">{{ edu.institution }}</h3>
            <span class="card-degree-badge">{{ edu.degree }}</span>
          </div>

          <p class="card-field" v-if="edu.fieldOfStudy">{{ edu.fieldOfStudy }}</p>

          <p class="card-dates">{{ formatDateRange(edu.startDate, edu.endDate, false) }}</p>

          <p v-if="edu.gpa" class="card-gpa">
            <span class="gpa-label">GPA</span>
            <span class="gpa-value">{{ edu.gpa }}</span>
          </p>

          <div v-if="edu.achievement" class="achievement-highlight">
            <span class="highlight-tag">Logro</span>
            <p class="highlight-text">{{ edu.achievement }}</p>
          </div>

          <p v-if="edu.description && !edu.achievement" class="card-description">
            {{ edu.description }}
          </p>
        </div>
      </div>

      <div v-if="!education.length" class="empty-state">
        <p>No hay estudios registrados todavía.</p>
      </div>
    </div>
  </section>
</template>

<style scoped>
.achievements {
  background: var(--color-bg);
  padding: 120px 0;
}

.section-title {
  text-align: center;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 80px;
  letter-spacing: -0.04em;
}

.achievement-grid {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
  max-width: 900px;
  margin: 0 auto;
}

.achievement-card {
  flex: 1 1 360px;
  max-width: 420px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  box-shadow: none;
  transition: transform 0.2s ease, border-color 0.2s ease;
}

.achievement-card:hover {
  border-color: var(--color-accent);
}

.card-frame {
  position: relative;
  height: 8px;
  background: var(--color-accent);
  border-bottom: 1px solid var(--color-border);
}

.card-body {
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 16px;
  flex-wrap: wrap;
}

.card-institution {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-text);
}

.card-degree-badge {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--color-accent);
  background: transparent;
  border: 1px solid var(--color-accent);
  padding: 0.15rem 0.6rem;
  border-radius: 0;
}

.card-field {
  margin: 0;
  font-size: 0.95rem;
  font-style: italic;
  color: var(--color-text-secondary);
}

.card-dates {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

.card-gpa {
  margin: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
}

.gpa-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.7;
}

.gpa-value {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-text);
}

.achievement-highlight {
  margin-top: 12px;
  padding: 20px;
  background: var(--color-surface);
  border: 1px solid var(--color-accent);
  border-left: 4px solid var(--color-accent);
  border-radius: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.highlight-tag {
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--color-accent);
}

.highlight-text {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text);
}

.card-description {
  margin: 0;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 80px 24px;
  color: var(--color-text-secondary);
}

@media (max-width: 900px) {
  .achievement-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px;
  }
}

@media (max-width: 600px) {
  .achievement-grid {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .achievement-card {
    animation: none !important;
    transition: none !important;
  }
}
</style>
