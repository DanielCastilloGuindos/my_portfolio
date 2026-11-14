<script setup lang="ts">
import { computed } from 'vue';
import type { Project, Profile, SocialLink } from '@portfolio/core';
import type { Theme } from '../themes/index';

const props = defineProps<{
  projects: Project[];
  theme: Theme;
  profile?: Profile | null;
  socialLinks?: SocialLink[];
}>();

const featuredProjects = computed<Project[]>(() => {
  return (props.projects.filter((p) => p.featured) ?? props.projects).slice(0, 5);
});

const sectionLinks = [
  { id: 'hero', label: 'Inicio' },
  { id: 'about', label: 'Sobre mí' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'carrera-profesional', label: 'Carrera profesional' },
  { id: 'contacto', label: 'Contacto' },
];

const emailAddress = computed(() => props.profile?.email || 'danielcastilloguindos@gmail.com');

function scrollToTop(e: Event): void {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}
</script>

<template>
  <footer class="site-footer" aria-label="Pie de página">
    <div class="footer-container">
      <!-- Top Bar: Brand + Social Channels with Icons -->
      <div class="footer-top-bar">
        <div class="brand-group">
          <span class="brand-name">{{ profile?.name || 'Daniel Castillo Guindos' }}</span>
          <span class="brand-role font-mono">// Frontend & Full Stack Developer</span>
        </div>

        <div class="social-channels font-mono">
          <!-- LinkedIn -->
          <a
            href="https://www.linkedin.com/in/dcastilloguindos"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn btn-linkedin"
            aria-label="Perfil de LinkedIn de Daniel Castillo"
          >
            <svg class="social-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
              <rect x="2" y="9" width="4" height="12"></rect>
              <circle cx="4" cy="4" r="2"></circle>
            </svg>
            <span>LinkedIn</span>
          </a>

          <!-- GitHub -->
          <a
            href="https://github.com/dannycastle"
            target="_blank"
            rel="noopener noreferrer"
            class="social-btn btn-github"
            aria-label="Perfil de GitHub de Daniel Castillo"
          >
            <svg class="social-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
            </svg>
            <span>GitHub</span>
          </a>

          <!-- Email -->
          <a
            :href="`mailto:${emailAddress}`"
            class="social-btn btn-email"
            aria-label="Enviar correo electrónico"
          >
            <svg class="social-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span>Email</span>
          </a>
        </div>
      </div>

      <!-- Main Footer Grid: Navigation, Featured Projects & The Doctor Who TARDIS Time Machine -->
      <div class="footer-grid">
        <!-- Column 1: Secciones -->
        <div class="footer-column">
          <span class="column-tag font-mono">// NAVEGACIÓN</span>
          <h3 class="footer-heading">Secciones</h3>
          <ul class="footer-list">
            <li v-for="link in sectionLinks" :key="link.id" class="footer-item">
              <a :href="`#${link.id}`" class="footer-link">
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 2: Proyectos Destacados -->
        <div class="footer-column">
          <span class="column-tag font-mono">// APLICACIONES</span>
          <h3 class="footer-heading">Proyectos Destacados</h3>
          <ul class="footer-list" v-if="featuredProjects.length">
            <li v-for="project in featuredProjects" :key="project.id" class="footer-item">
              <a
                :href="project.url || project.liveUrl || project.repoUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="footer-link"
                :aria-label="`Ver proyecto ${project.title || project.name}`"
              >
                {{ project.title || project.name }}
              </a>
            </li>
          </ul>
        </div>

        <!-- Column 3: The Doctor Who TARDIS (Time Travel Easter Egg) -->
        <div class="footer-column tardis-column">
          <span class="column-tag font-mono">// EASTER EGG · TIME MACHINE</span>
          <h3 class="footer-heading">Viaje en el Tiempo</h3>

          <a
            href="https://danielcastilloguindos.github.io/portfolio/"
            target="_blank"
            rel="noopener noreferrer"
            class="tardis-card"
            title="Sube a la TARDIS para viajar a mi portfolio anterior (2021)"
            aria-label="Viajar en el tiempo a mi portfolio anterior en GitHub Pages"
          >
            <!-- 3D Rotating Doctor Who TARDIS Police Box -->
            <div class="tardis-scene" aria-hidden="true">
              <div class="tardis-box">
                <!-- Top flashing lantern -->
                <div class="tardis-lamp"></div>
                <!-- Slanted roof pyramid -->
                <div class="tardis-roof"></div>

                <!-- 4 3D Faces -->
                <div class="tardis-face face-front">
                  <div class="police-sign">POLICE BOX</div>
                  <div class="face-windows">
                    <span class="win-pane"></span>
                    <span class="win-pane"></span>
                  </div>
                  <div class="face-panels">
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                  </div>
                </div>

                <div class="tardis-face face-back">
                  <div class="police-sign">POLICE BOX</div>
                  <div class="face-windows">
                    <span class="win-pane"></span>
                    <span class="win-pane"></span>
                  </div>
                  <div class="face-panels">
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                  </div>
                </div>

                <div class="tardis-face face-left">
                  <div class="police-sign">POLICE BOX</div>
                  <div class="face-windows">
                    <span class="win-pane"></span>
                    <span class="win-pane"></span>
                  </div>
                  <div class="face-panels">
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                  </div>
                </div>

                <div class="tardis-face face-right">
                  <div class="police-sign">POLICE BOX</div>
                  <div class="face-windows">
                    <span class="win-pane"></span>
                    <span class="win-pane"></span>
                  </div>
                  <div class="face-panels">
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                    <div class="door-panel"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- TARDIS Info Prompt -->
            <div class="tardis-info">
              <span class="tardis-pill font-mono">TARDIS Type 40</span>
              <p class="tardis-prompt">
                ¿Quieres ver cómo empezó todo? Sube a la cabina y viaja al portfolio anterior.
              </p>
              <span class="tardis-cta font-mono">
                Viajar al pasado (2021)
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </span>
            </div>
          </a>
        </div>
      </div>

      <!-- Footer Bottom Bar -->
      <div class="footer-bottom">
        <p class="copyright font-mono">
          &copy; {{ new Date().getFullYear() }} Daniel Castillo Guindos. Construido con Astro, Vue 3 & GSAP.
        </p>

        <a href="#hero" class="back-to-top font-mono" @click="scrollToTop" aria-label="Volver al inicio">
          <span>Volver arriba</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.site-footer {
  position: relative;
  background: #17171e;
  border-top: 1px solid var(--color-border);
  margin-top: 140px;
  padding: 80px 0 36px;
  box-sizing: border-box;
  overflow: clip;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Top Bar */
.footer-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 40px;
  border-bottom: 1px solid rgba(54, 54, 70, 0.5);
  margin-bottom: 48px;
  flex-wrap: wrap;
  gap: 24px;
}

.brand-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.brand-name {
  font-family: var(--font-display, 'Bricolage Grotesque', sans-serif);
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.brand-role {
  font-size: 0.84rem;
  color: var(--color-accent);
  letter-spacing: 0.04em;
}

/* Social Channels */
.social-channels {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-md, 2px);
  border: 1px solid var(--color-border);
  background: rgba(38, 38, 50, 0.6);
  color: var(--color-text);
  transition: all 0.25s ease;
  touch-action: manipulation;
}

.social-btn:hover {
  background: var(--color-surface);
  border-color: var(--color-accent);
  color: var(--color-accent);
  transform: translateY(-2px);
}

.social-icon {
  flex-shrink: 0;
}

/* Main Grid */
.footer-grid {
  display: grid;
  grid-template-columns: 1fr 1.2fr 1.6fr;
  gap: 48px;
  margin-bottom: 60px;
}

.column-tag {
  display: inline-block;
  font-size: 0.74rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.08em;
  margin-bottom: 8px;
  opacity: 0.9;
}

.footer-heading {
  margin: 0 0 20px;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.02em;
}

.footer-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.footer-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.92rem;
  transition: color 0.2s ease, transform 0.2s ease;
  display: inline-block;
  padding: 2px 0;
}

.footer-link:hover {
  color: var(--color-accent);
  transform: translateX(3px);
}

/* TARDIS Card & 3D CSS Model */
.tardis-column {
  display: flex;
  flex-direction: column;
}

.tardis-card {
  display: flex;
  align-items: center;
  gap: 24px;
  background: rgba(38, 38, 50, 0.65);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  padding: 20px 22px;
  text-decoration: none;
  color: inherit;
  transition: border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.tardis-card::before {
  content: '';
  position: absolute;
  top: -40%;
  left: -20%;
  width: 140%;
  height: 180%;
  background: radial-gradient(circle at 30% 50%, rgba(0, 140, 255, 0.12) 0%, transparent 60%);
  pointer-events: none;
  opacity: 0.7;
  transition: opacity 0.3s ease;
}

.tardis-card:hover {
  border-color: rgba(0, 160, 255, 0.5);
  box-shadow: 0 12px 32px rgba(0, 59, 111, 0.35);
  transform: translateY(-2px);
}

.tardis-card:hover::before {
  opacity: 1;
}

/* 3D Scene for TARDIS */
.tardis-scene {
  width: 58px;
  height: 94px;
  perspective: 550px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tardis-box {
  width: 44px;
  height: 78px;
  position: relative;
  transform-style: preserve-3d;
  animation: spinTardis 11s linear infinite;
  will-change: transform;
}

.tardis-card:hover .tardis-box {
  animation-duration: 3.5s;
}

@keyframes spinTardis {
  0% {
    transform: rotateX(-8deg) rotateY(0deg);
  }
  100% {
    transform: rotateX(-8deg) rotateY(360deg);
  }
}

/* Top Lamp */
.tardis-lamp {
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #e0f7fa;
  box-shadow: 0 0 10px #00e5ff, 0 0 16px rgba(0, 229, 255, 0.8);
  animation: lampPulse 1.8s infinite ease-in-out;
  z-index: 10;
}

@keyframes lampPulse {
  0%, 100% {
    opacity: 0.95;
    box-shadow: 0 0 12px #00e5ff, 0 0 20px rgba(0, 229, 255, 0.8);
  }
  50% {
    opacity: 0.45;
    box-shadow: 0 0 4px #00e5ff, 0 0 8px rgba(0, 229, 255, 0.4);
  }
}

/* Roof */
.tardis-roof {
  position: absolute;
  top: -4px;
  left: 2px;
  width: 40px;
  height: 4px;
  background: #002244;
  border: 1px solid #003b6f;
}

/* 4 TARDIS Faces */
.tardis-face {
  position: absolute;
  width: 44px;
  height: 78px;
  background: #003b6f;
  border: 1px solid #001f3f;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 3px;
  gap: 2px;
  box-shadow: inset 0 0 6px rgba(0, 0, 0, 0.6);
}

.face-front {
  transform: translateZ(22px);
}

.face-back {
  transform: rotateY(180deg) translateZ(22px);
}

.face-left {
  transform: rotateY(-90deg) translateZ(22px);
}

.face-right {
  transform: rotateY(90deg) translateZ(22px);
}

.police-sign {
  background: #000;
  color: #fff;
  font-size: 4px;
  font-weight: 800;
  text-align: center;
  letter-spacing: 0.2px;
  line-height: 7px;
  height: 7px;
  border: 0.5px solid #222;
  font-family: sans-serif;
  overflow: hidden;
}

.face-windows {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
  height: 18px;
}

.win-pane {
  background: #e1f5fe;
  border: 0.5px solid #002244;
  opacity: 0.9;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
}

.face-panels {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 2px;
  flex: 1;
}

.door-panel {
  background: #002e5b;
  border: 0.5px solid #001933;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.4);
}

/* TARDIS Info */
.tardis-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.tardis-pill {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #70b5f9;
  letter-spacing: 0.06em;
}

.tardis-prompt {
  font-size: 0.86rem;
  line-height: 1.45;
  color: var(--color-text-secondary);
  margin: 0;
}

.tardis-cta {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-accent);
  margin-top: 2px;
  transition: transform 0.2s ease;
}

.tardis-card:hover .tardis-cta {
  transform: translateX(3px);
  color: #fff;
}

/* Footer Bottom */
.footer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 28px;
  border-top: 1px solid rgba(54, 54, 70, 0.35);
  flex-wrap: wrap;
  gap: 16px;
}

.copyright {
  font-size: 0.8rem;
  color: var(--color-text-secondary);
  margin: 0;
}

.back-to-top {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-decoration: none;
  transition: color 0.2s ease, transform 0.2s ease;
}

.back-to-top:hover {
  color: var(--color-accent);
  transform: translateY(-2px);
}

@media (max-width: 960px) {
  .footer-grid {
    grid-template-columns: 1fr 1fr;
    gap: 36px;
  }

  .tardis-column {
    grid-column: span 2;
  }
}

@media (max-width: 640px) {
  .site-footer {
    margin-top: 80px;
    padding: 50px 0 30px;
  }

  .footer-top-bar {
    flex-direction: column;
    align-items: flex-start;
  }

  .social-channels {
    width: 100%;
  }

  .social-btn {
    flex: 1 1 100px;
    justify-content: center;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: 36px;
  }

  .tardis-column {
    grid-column: span 1;
  }

  .tardis-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
    padding: 20px 16px;
  }

  .tardis-cta {
    justify-content: center;
  }

  .footer-bottom {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>