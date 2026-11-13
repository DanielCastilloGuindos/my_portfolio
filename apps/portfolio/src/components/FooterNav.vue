<script setup lang="ts">
import type { Project } from '@portfolio/core';
import type { Theme } from '../themes/index';

const props = defineProps<{
  projects: Project[];
  theme: Theme;
}>();

const featuredProjects = computedFeatured();

function computedFeatured(): Project[] {
  return (props.projects.filter((p) => p.featured) ?? []).slice(0, 6);
}

const sectionLinks = [
  { id: 'hero', label: 'Sobre mí' },
  { id: 'experiencias', label: 'Experiencias' },
  { id: 'estudios', label: 'Estudios' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'contacto', label: 'Contacto' },
];
</script>

<template>
  <footer class="site-footer" aria-label="Pie de página">
    <div class="footer-grid">
      <div class="footer-column projects-column">
        <h3 class="footer-heading">Proyectos destacados</h3>
        <ul class="footer-list" v-if="featuredProjects.length">
          <li v-for="project in featuredProjects" :key="project.id" class="footer-item">
            <a
              :href="project.url || project.repoUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="footer-link"
              :aria-label="`Ver proyecto ${project.name}`"
            >
              {{ project.name }}
            </a>
          </li>
        </ul>
        <p v-else class="footer-empty">No hay proyectos destacados todavía.</p>
      </div>

      <div class="footer-column sections-column">
        <h3 class="footer-heading">Secciones</h3>
        <ul class="footer-list">
          <li
            v-for="link in sectionLinks"
            :key="link.id"
            class="footer-item"
          >
            <a
              :href="`#${link.id}`"
              class="footer-link"
              :aria-label="`Ir a ${link.label}`"
            >
              {{ link.label }}
            </a>
          </li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom">
      <p class="copyright">
        &copy; {{ new Date().getFullYear() }} Portfolio. Diseñado con Astro,
        Vue y GSAP.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  background: var(--color-bg);
  border-top: none;
  margin-top: 240px;
  padding: 80px 0 40px;
}

.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  max-width: 1024px;
  margin: 0 auto 48px;
}

.footer-heading {
  margin: 0 0 24px;
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.04em;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.footer-item a {
  color: var(--color-text-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
  font-size: 0.95rem;
  touch-action: manipulation;
  padding: 4px 0;
  border-radius: 0;
  transition: color 0.2s ease;
}

.footer-item a:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.footer-item a:hover {
  color: var(--color-accent);
}

.footer-empty {
  margin: 0;
  font-size: 0.9rem;
  color: var(--color-text-secondary);
  font-style: italic;
}

.footer-bottom {
  max-width: 1024px;
  margin: 0 auto;
  padding-top: 32px;
  border-top: none;
  display: flex;
  justify-content: center;
  gap: 16px;
}

.copyright {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-secondary);
}

@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 48px;
  }
}
</style>
