<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';

interface LinkItem {
  id?: string;
  label: string;
  url: string;
}

const props = defineProps<{
  title?: string;
  logoUrl?: string;
  cvUrl?: string;
  customLinks?: LinkItem[];
}>();

const defaultLinks: LinkItem[] = [
  { id: 'link-hero', label: 'Inicio', url: '#hero' },
  { id: 'link-about', label: 'Sobre mí', url: '#about' },
  { id: 'link-proyectos', label: 'Proyectos', url: '#proyectos' },
  { id: 'link-carrera', label: 'Carrera profesional', url: '#carrera-profesional' },
  { id: 'link-contact', label: 'Contacto', url: '#contacto' },
];

const allLinks = computed<LinkItem[]>(() => {
  if (props.customLinks && props.customLinks.length > 0) {
    return props.customLinks;
  }
  return defaultLinks;
});

// Primary links exclude Contacto because it is rendered as an action button
const primaryLinks = computed<LinkItem[]>(() => {
  return allLinks.value.filter(
    (link) => !link.url.includes('contacto') && link.label.toLowerCase() !== 'contacto'
  );
});

const isMenuOpen = ref(false);
const isVisible = ref(false);
const drawerRef = ref<HTMLElement | null>(null);
const menuButtonRef = ref<HTMLButtonElement | null>(null);
let scrollFrame = 0;

async function toggleMenu(): Promise<void> {
  isMenuOpen.value = !isMenuOpen.value;
  if (isMenuOpen.value) {
    await nextTick();
    drawerRef.value?.querySelector<HTMLElement>('a, button')?.focus();
  } else {
    menuButtonRef.value?.focus();
  }
}

function closeMenu(): void {
  isMenuOpen.value = false;
}

function handleScroll(): void {
  if (scrollFrame) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = 0;
    updateVisibility();
  });
}

function updateVisibility(): void {
  const heroElement = document.getElementById('hero');
  if (heroElement) {
    const rect = heroElement.getBoundingClientRect();
    isVisible.value = rect.bottom <= 80;
  } else {
    isVisible.value = window.scrollY > 300;
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu();
    menuButtonRef.value?.focus();
  }
}

onMounted(() => {
  updateVisibility();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
  if (scrollFrame) window.cancelAnimationFrame(scrollFrame);
  window.removeEventListener('scroll', handleScroll);
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <header
    class="site-header"
    :class="{ 'is-visible': isVisible }"
    role="banner"
    aria-label="Cabecera principal"
  >
    <div class="header-container">
      <!-- Left: Logo & Title -->
      <a href="#hero" class="brand" @click="closeMenu">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="Logo"
          class="brand-logo"
          width="40"
          height="32"
        />
        <span class="brand-title">{{ title || 'Danny Castillo' }}</span>
      </a>

      <!-- Right: Desktop Navigation with links, divider '|', and action buttons -->
      <nav class="nav-desktop" aria-label="Navegación de escritorio">
        <div class="nav-content">
          <ul class="nav-links">
            <li v-for="link in primaryLinks" :key="link.id ?? link.url">
              <a :href="link.url" class="nav-link">{{ link.label }}</a>
            </li>
          </ul>

          <span class="nav-divider" aria-hidden="true">|</span>

          <div class="nav-actions">
            <a
              :href="cvUrl || '/CV_Daniel_Castillo_2026.pdf'"
              download="CV_Daniel_Castillo_2026.pdf"
              target="_blank"
              rel="noopener noreferrer"
              class="header-btn btn-header-cv"
              aria-label="Descargar CV en PDF"
            >
              <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              <span>Descargar CV</span>
            </a>

            <a
              href="#contacto"
              class="header-btn btn-header-contact"
              aria-label="Ir a Contacto"
            >
              Contacto
            </a>
          </div>
        </div>
      </nav>

      <!-- Right: Mobile Hamburger Button (2 lines, top 100%, bottom 75%, aligned left) -->
      <button
        type="button"
        ref="menuButtonRef"
        class="hamburger-btn"
        :class="{ 'is-active': isMenuOpen }"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-menu"
        aria-label="Menú de navegación"
        @click="toggleMenu"
      >
        <span class="line line-top" aria-hidden="true"></span>
        <span class="line line-bot" aria-hidden="true"></span>
      </button>
    </div>

    <!-- Mobile Drawer Menu: Strictly hidden when closed so no part peeks out -->
    <div
      ref="drawerRef"
      id="mobile-menu"
      class="mobile-drawer"
      :class="{ 'is-open': isMenuOpen }"
      :aria-hidden="!isMenuOpen"
      :inert="!isMenuOpen"
    >
      <nav class="mobile-nav" aria-label="Navegación móvil">
        <ul class="mobile-links">
          <li v-for="link in primaryLinks" :key="link.id ?? link.url">
            <a :href="link.url" class="mobile-link" @click="closeMenu">
              {{ link.label }}
            </a>
          </li>
        </ul>

        <div class="mobile-actions">
          <a
            href="#contacto"
            class="header-btn btn-header-contact mobile-btn"
            @click="closeMenu"
          >
            Contacto
          </a>

          <a
            :href="cvUrl || '/CV_Daniel_Castillo_2026.pdf'"
            download="CV_Daniel_Castillo_2026.pdf"
            target="_blank"
            rel="noopener noreferrer"
            class="header-btn btn-header-cv mobile-btn"
            @click="closeMenu"
          >
            <svg class="btn-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Descargar CV</span>
          </a>
        </div>
      </nav>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0;
  margin: 0;
  background: rgba(31, 31, 40, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid var(--color-border);
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
}

.site-header.is-visible {
  transform: translateY(0);
  opacity: 1;
  pointer-events: auto;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: var(--color-text);
  flex-shrink: 0;
}

.brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-family: var(--font-display, 'Bricolage Grotesque', sans-serif);
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--color-text);
  transition: color 0.2s ease;
}

.brand:hover .brand-title {
  color: var(--color-accent);
}

.nav-desktop {
  display: block;
}

.nav-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 24px;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.92rem;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
  padding: 4px 0;
}

.nav-link:hover {
  color: var(--color-accent);
}

.nav-divider {
  color: var(--color-border);
  font-size: 1.15rem;
  font-weight: 300;
  opacity: 0.6;
  user-select: none;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* Header Action Buttons */
.header-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--radius-md, 2px);
  padding: 7px 14px;
  transition: all 0.2s ease;
  touch-action: manipulation;
  cursor: pointer;
  white-space: nowrap;
}

.btn-header-cv {
  background: rgba(220, 215, 186, 0.06);
  border: 1px solid var(--color-border);
  color: var(--color-text);
}

.btn-header-cv:hover {
  background: rgba(230, 195, 132, 0.12);
  border-color: var(--color-accent);
  color: var(--color-accent);
}

.btn-header-contact {
  background: var(--color-accent);
  border: 1px solid var(--color-accent);
  color: var(--color-bg);
}

.btn-header-contact:hover {
  background: var(--color-accent-hover);
  border-color: var(--color-accent-hover);
  color: var(--color-bg);
}

.btn-icon {
  flex-shrink: 0;
}

/* 2-line Hamburger Button (Top: 100%, Bot: 75%, Aligned Left) */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 6px;
  width: 38px;
  height: 38px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 6px 2px;
}

.line {
  display: block;
  height: 2px;
  background-color: var(--color-text);
  border-radius: 2px;
  transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, width 0.25s ease, background-color 0.2s ease;
  transform-origin: center left;
}

.line-top {
  width: 24px; /* 100% full width */
}

.line-bot {
  width: 18px; /* 75% width */
}

.hamburger-btn:hover .line {
  background-color: var(--color-accent);
}

/* Active hamburger forming an X */
.hamburger-btn.is-active .line-top {
  width: 20px;
  transform: translate(3px, 5px) rotate(45deg);
}

.hamburger-btn.is-active .line-bot {
  width: 20px;
  transform: translate(3px, -5px) rotate(-45deg);
}

/* Mobile Drawer Menu */
.mobile-drawer {
  display: none;
  background: var(--color-surface);
  border-bottom: 1px solid transparent;
  padding: 0 24px;
  max-height: 0;
  opacity: 0;
  visibility: hidden;
  overflow: hidden;
  pointer-events: none;
  transition: max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease, padding 0.3s ease, border-color 0.2s ease;
}

.mobile-drawer.is-open {
  display: block;
  max-height: 440px;
  padding: 16px 24px 24px;
  opacity: 1;
  visibility: visible;
  border-bottom-color: var(--color-border);
  pointer-events: auto;
}

.mobile-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.05rem;
  font-weight: 500;
  display: block;
  padding: 8px 0;
  border-bottom: 1px solid rgba(54, 54, 70, 0.4);
  transition: color 0.2s ease;
}

.mobile-link:hover {
  color: var(--color-accent);
}

.mobile-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
  padding-top: 12px;
}

.mobile-btn {
  width: 100%;
  padding: 11px 16px;
  font-size: 0.95rem;
}

@media (max-width: 860px) {
  .nav-desktop {
    display: none;
  }

  .hamburger-btn {
    display: flex;
  }

  .mobile-drawer {
    display: block;
  }
}
</style>
