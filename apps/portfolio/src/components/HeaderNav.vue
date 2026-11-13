<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import type { NavLink } from '@portfolio/core';

interface LinkItem {
  id?: string;
  label: string;
  url: string;
}

const props = defineProps<{
  title?: string;
  logoUrl?: string;
  customLinks?: LinkItem[];
}>();

const defaultLinks: LinkItem[] = [
  { id: 'link-hero', label: 'Inicio', url: '#hero' },
  { id: 'link-about', label: 'Sobre mí', url: '#about' },
  { id: 'link-exp', label: 'Experiencias', url: '#experiencias' },
  { id: 'link-edu', label: 'Estudios', url: '#estudios' },
  { id: 'link-portfolio', label: 'Portfolio', url: '#portfolio' },
  { id: 'link-contact', label: 'Contacto', url: '#contacto' },
];

const links = computed<LinkItem[]>(() => {
  if (props.customLinks && props.customLinks.length > 0) {
    return props.customLinks;
  }
  return defaultLinks;
});

const isMenuOpen = ref(false);
const isVisible = ref(false);

function toggleMenu(): void {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu(): void {
  isMenuOpen.value = false;
}

function handleScroll(): void {
  // Determine if the user has scrolled past the hero section
  const heroElement = document.getElementById('hero');
  if (heroElement) {
    const rect = heroElement.getBoundingClientRect();
    // When hero bottom is at or above top threshold, show header
    isVisible.value = rect.bottom <= 80;
  } else {
    isVisible.value = window.scrollY > 300;
  }
}

function onKeydown(e: KeyboardEvent): void {
  if (e.key === 'Escape' && isMenuOpen.value) {
    closeMenu();
  }
}

onMounted(() => {
  handleScroll();
  window.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('keydown', onKeydown);
});

onUnmounted(() => {
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
      <!-- Left: Logo & Title (editable from apps/manager) -->
      <a href="#hero" class="brand" @click="closeMenu">
        <img
          v-if="logoUrl"
          :src="logoUrl"
          alt="Logo"
          class="brand-logo"
        />
        <span class="brand-title">{{ title || 'Danny Castillo' }}</span>
      </a>

      <!-- Right: Desktop Navigation -->
      <nav class="nav-desktop" aria-label="Navegación de escritorio">
        <ul class="nav-links">
          <li v-for="link in links" :key="link.id ?? link.url">
            <a :href="link.url" class="nav-link">{{ link.label }}</a>
          </li>
        </ul>
      </nav>

      <!-- Right: Mobile Hamburger Button -->
      <!-- 3 horizontal lines: 2 same width, bottom line shorter -->
      <button
        type="button"
        class="hamburger-btn"
        :class="{ 'is-active': isMenuOpen }"
        :aria-expanded="isMenuOpen"
        aria-controls="mobile-menu"
        aria-label="Menú de navegación"
        @click="toggleMenu"
      >
        <span class="line line-top" aria-hidden="true"></span>
        <span class="line line-mid" aria-hidden="true"></span>
        <span class="line line-bot" aria-hidden="true"></span>
      </button>
    </div>

    <!-- Mobile Drawer Menu -->
    <div
      id="mobile-menu"
      class="mobile-drawer"
      :class="{ 'is-open': isMenuOpen }"
      :aria-hidden="!isMenuOpen"
    >
      <nav class="mobile-nav" aria-label="Navegación móvil">
        <ul class="mobile-links">
          <li v-for="link in links" :key="link.id ?? link.url">
            <a :href="link.url" class="mobile-link" @click="closeMenu">
              {{ link.label }}
            </a>
          </li>
        </ul>
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
  max-width: 1024px;
  margin: 0 auto;
  padding: 0 24px;
  height: 52px;
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
}

.brand-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.brand-title {
  font-family: var(--font-display, 'Bricolage Grotesque', sans-serif);
  font-size: 1.2rem;
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

.nav-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 28px;
}

.nav-link {
  color: var(--color-text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s ease;
  position: relative;
  padding: 4px 0;
}

.nav-link:hover {
  color: var(--color-accent);
}

/* Mobile Hamburger Button with 3 lines */
/* Top 2 equal width (22px), bottom one shorter (14px) */
.hamburger-btn {
  display: none;
  flex-direction: column;
  justify-content: center;
  align-items: flex-end;
  gap: 5px;
  width: 40px;
  height: 40px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px 4px;
}

.line {
  display: block;
  height: 2px;
  background-color: var(--color-text);
  border-radius: 1px;
  transition: transform 0.25s ease, opacity 0.25s ease, width 0.25s ease, background-color 0.2s ease;
}

.line-top {
  width: 22px;
}

.line-mid {
  width: 22px;
}

.line-bot {
  width: 14px;
}

.hamburger-btn:hover .line {
  background-color: var(--color-accent);
}

/* Transform into an X when active */
.hamburger-btn.is-active .line-top {
  transform: translateY(7px) rotate(45deg);
  width: 22px;
}

.hamburger-btn.is-active .line-mid {
  opacity: 0;
}

.hamburger-btn.is-active .line-bot {
  transform: translateY(-7px) rotate(-45deg);
  width: 22px;
}

/* Mobile Drawer */
.mobile-drawer {
  display: none;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 16px 24px 24px;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.mobile-drawer.is-open {
  max-height: 360px;
  display: block;
}

.mobile-links {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mobile-link {
  color: var(--color-text);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  display: block;
  padding: 6px 0;
  border-bottom: 1px solid rgba(54, 54, 70, 0.4);
  transition: color 0.2s ease;
}

.mobile-link:hover {
  color: var(--color-accent);
}

@media (max-width: 768px) {
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
