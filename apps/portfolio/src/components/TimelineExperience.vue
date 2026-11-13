<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, shallowRef } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Experience, WorkExperience } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';

gsap.registerPlugin(ScrollTrigger);

type ExperienceItem = Experience & WorkExperience;

const props = defineProps<{
  experiences: ExperienceItem[];
  theme: Theme;
}>();

const rootEl = ref<HTMLElement | null>(null);
const timelineWrapperEl = ref<HTMLElement | null>(null);
const spineProgressEl = ref<HTMLElement | null>(null);

// Dual-layer video elements for smooth crossfading without cuts
const videoA = ref<HTMLVideoElement | null>(null);
const videoB = ref<HTMLVideoElement | null>(null);
const activeVideoSlot = ref<'A' | 'B'>('A');
const activeVideoUrl = shallowRef<string | null>(null);

let ctx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;

/**
 * Crossfades between video buffers smoothly and updates current video playback
 */
function switchBackgroundVideo(url?: string): void {
  if (!url) {
    if (videoA.value) gsap.to(videoA.value, { autoAlpha: 0, duration: 0.5, overwrite: 'auto' });
    if (videoB.value) gsap.to(videoB.value, { autoAlpha: 0, duration: 0.5, overwrite: 'auto' });
    activeVideoUrl.value = null;
    return;
  }

  if (activeVideoUrl.value === url) {
    return;
  }

  const incomingSlot = activeVideoSlot.value === 'A' ? 'B' : 'A';
  const incomingVideo = incomingSlot === 'A' ? videoA.value : videoB.value;
  const outgoingVideo = activeVideoSlot.value === 'A' ? videoA.value : videoB.value;

  if (!incomingVideo) return;

  activeVideoUrl.value = url;
  activeVideoSlot.value = incomingSlot;

  incomingVideo.src = url;
  incomingVideo.load();

  const onLoadedMetadata = () => {
    incomingVideo.removeEventListener('loadedmetadata', onLoadedMetadata);
    incomingVideo.currentTime = 0;
    incomingVideo.pause();

    // Crossfade: incoming layer fades in, outgoing layer fades out
    gsap.to(incomingVideo, { autoAlpha: 0.45, duration: 0.65, ease: 'power2.inOut', overwrite: 'auto' });
    if (outgoingVideo) {
      gsap.to(outgoingVideo, { autoAlpha: 0, duration: 0.65, ease: 'power2.inOut', overwrite: 'auto' });
    }
  };

  if (incomingVideo.readyState >= 1) {
    onLoadedMetadata();
  } else {
    incomingVideo.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
  }
}

/**
 * Scrubs active video playback according to scroll progress
 */
function scrubActiveVideo(progress: number): void {
  const currentVideo = activeVideoSlot.value === 'A' ? videoA.value : videoB.value;
  if (!currentVideo || isNaN(currentVideo.duration) || currentVideo.duration === 0) return;
  currentVideo.currentTime = progress * currentVideo.duration;
}

function initTimelineAnimations(): void {
  if (!rootEl.value || !timelineWrapperEl.value) return;

  ctx = gsap.context(() => {
    // 1. Overall timeline vertical spine drawing (scaleY from top center)
    if (spineProgressEl.value) {
      gsap.fromTo(
        spineProgressEl.value,
        { scaleY: 0, transformOrigin: 'top center' },
        {
          scaleY: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: timelineWrapperEl.value,
            start: 'top 70%',
            end: 'bottom 80%',
            scrub: true,
          },
        },
      );
    }

    // 2. Responsive matching via gsap.matchMedia
    mm = gsap.matchMedia();

    // Setup cards animations for both desktop and mobile
    mm.add('(min-width: 0px)', () => {
      const items = rootEl.value?.querySelectorAll<HTMLElement>('.experience-milestone') ?? [];

      items.forEach((item, index) => {
        const card = item.querySelector<HTMLElement>('.experience-card');
        const node = item.querySelector<HTMLElement>('.spine-node');
        const exp = props.experiences[index];
        const videoSrc = exp?.backgroundVideoUrl || exp?.videoUrl;

        if (!card) return;

        // Ensure starting state (only transform and autoAlpha, no CSS transition conflict)
        gsap.set(card, { y: 60, autoAlpha: 0 });

        // ScrollTrigger scrubbed timeline: enters from bottom (y:60, alpha:0), stays at center (y:0, alpha:1), leaves top (y:-60, alpha:0)
        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: item,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 1,
            onEnter: () => {
              switchBackgroundVideo(videoSrc);
            },
            onEnterBack: () => {
              switchBackgroundVideo(videoSrc);
            },
            onUpdate: (self) => {
              if (self.isActive && videoSrc) {
                scrubActiveVideo(self.progress);
              }
            },
          },
        });

        // Enter: y: 60 -> y: 0, autoAlpha: 0 -> 1
        cardTl.fromTo(
          card,
          { y: 60, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, ease: 'power1.out' },
        );

        // Center dwell
        cardTl.to(card, { y: 0, autoAlpha: 1, duration: 0.8 });

        // Exit: y: 0 -> y: -60, autoAlpha: 1 -> 0
        cardTl.to(
          card,
          { y: -60, autoAlpha: 0, duration: 1, ease: 'power1.in' },
        );

        // Central Node highlight synchronization
        if (node) {
          ScrollTrigger.create({
            trigger: item,
            start: 'top 60%',
            end: 'bottom 40%',
            onToggle: (self) => {
              if (self.isActive) {
                node.classList.add('is-active');
                gsap.to(node, { scale: 1.35, autoAlpha: 1, duration: 0.3, overwrite: 'auto' });
              } else {
                node.classList.remove('is-active');
                gsap.to(node, { scale: 1, autoAlpha: 0.8, duration: 0.3, overwrite: 'auto' });
              }
            },
          });
        }
      });
    });
  }, rootEl.value);
}

onMounted(() => {
  nextTick(() => {
    if (prefersReducedMotion()) {
      // In reduced motion mode, show cards statically without scrubbed shifts
      const cards = rootEl.value?.querySelectorAll<HTMLElement>('.experience-card') ?? [];
      cards.forEach((card) => {
        gsap.set(card, { y: 0, autoAlpha: 1 });
      });
      return;
    }
    initTimelineAnimations();
  });
});

onUnmounted(() => {
  if (mm) {
    mm.revert();
    mm = null;
  }
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  if (videoA.value) {
    videoA.value.pause();
    videoA.value.src = '';
  }
  if (videoB.value) {
    videoB.value.pause();
    videoB.value.src = '';
  }
});
</script>

<template>
  <section
    id="experiencias"
    ref="rootEl"
    class="experience-section portfolio-section"
    aria-labelledby="experience-heading"
  >
    <!-- Sticky Fullscreen Video Layer with Dual-Buffer Crossfading -->
    <div class="video-background-pinned" aria-hidden="true">
      <video
        ref="videoA"
        class="bg-video layer-a"
        muted
        playsinline
        preload="auto"
      ></video>
      <video
        ref="videoB"
        class="bg-video layer-b"
        muted
        playsinline
        preload="auto"
      ></video>
      <!-- Ambient Fallback Gradient -->
      <div class="video-placeholder"></div>
      <!-- Subtle Dark Overlay for Legible Typography -->
      <div class="video-overlay-tint"></div>
    </div>

    <div class="container">
      <header class="section-header">
        <h2 id="experience-heading" class="section-title">Experiencia Laboral</h2>
        <p class="section-subtitle">Trayectoria profesional orientada a rendimiento y arquitectura web</p>
      </header>

      <!-- Central Zig-Zag Timeline Wrapper -->
      <div ref="timelineWrapperEl" class="timeline-wrapper">
        <!-- Background Spine Line (Dim Base) -->
        <div class="timeline-spine-track" aria-hidden="true">
          <!-- Animated Progress Spine (Drawn on scroll) -->
          <div ref="spineProgressEl" class="timeline-spine-progress"></div>
        </div>

        <!-- Experience Milestones (Zig-zag desktop / Left-aligned mobile) -->
        <div
          v-for="(exp, index) in experiences"
          :key="exp.id || exp.company"
          class="experience-milestone"
          :class="[index % 2 === 0 ? 'milestone-left' : 'milestone-right']"
        >
          <!-- Center Spine Node -->
          <div class="spine-node" aria-hidden="true">
            <span class="spine-node-dot"></span>
          </div>

          <!-- Experience Card Item -->
          <article class="experience-card">
            <!-- Header: Role & Period -->
            <div class="card-header">
              <span class="period-badge">{{ exp.period || '2021 – Presente' }}</span>
              <h3 class="role-title">{{ exp.role || exp.position }}</h3>
              <div class="company-row">
                <span class="company-name">{{ exp.company }}</span>
                <span v-if="exp.location" class="location-tag">· {{ exp.location }}</span>
              </div>
            </div>

            <!-- Highlights / Key Accomplishments -->
            <ul v-if="exp.highlights && exp.highlights.length" class="highlights-list">
              <li v-for="(highlight, hIdx) in exp.highlights" :key="hIdx" class="highlight-item">
                {{ highlight }}
              </li>
            </ul>
            <p v-else-if="exp.description" class="card-desc">
              {{ exp.description }}
            </p>

            <!-- Tech Stack Badges -->
            <div v-if="exp.stack && exp.stack.length" class="stack-wrapper">
              <span v-for="tech in exp.stack" :key="tech" class="tech-pill">
                {{ tech }}
              </span>
            </div>
          </article>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience-section {
  position: relative;
  width: 100%;
  padding: 100px 0 120px;
  overflow: clip;
}

.container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  z-index: 2;
}

.section-header {
  text-align: center;
  margin-bottom: 70px;
}

.section-title {
  font-size: 2.2rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px;
  letter-spacing: -0.03em;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  margin: 0;
}

/* Pinned sticky background video container */
.video-background-pinned {
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  margin-bottom: -100vh;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  visibility: hidden;
  will-change: transform, opacity;
}

.video-placeholder {
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 50% 40%, rgba(42, 42, 55, 0.7) 0%, rgba(31, 31, 40, 0.96) 100%);
  z-index: -1;
}

.video-overlay-tint {
  position: absolute;
  inset: 0;
  background: rgba(31, 31, 40, 0.75);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Timeline Layout */
.timeline-wrapper {
  position: relative;
  max-width: 1040px;
  margin: 0 auto;
  padding: 20px 0 60px;
}

/* Vertical central spine line */
.timeline-spine-track {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: rgba(220, 215, 186, 0.12);
  transform: translateX(-50%);
  z-index: 1;
}

.timeline-spine-progress {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    var(--color-accent) 0%,
    var(--color-accent-hover) 100%
  );
  box-shadow: 0 0 10px rgba(230, 195, 132, 0.6);
  transform-origin: top center;
  will-change: transform;
}

/* Milestone item wrapper */
.experience-milestone {
  position: relative;
  display: flex;
  align-items: center;
  min-height: 80vh;
  margin-bottom: 30px;
}

.experience-milestone.milestone-left {
  justify-content: flex-start;
}

.experience-milestone.milestone-right {
  justify-content: flex-end;
}

/* Center node connecting line */
.spine-node {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: var(--color-bg);
  border: 2px solid var(--color-accent);
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  will-change: transform, opacity;
}

.spine-node.is-active {
  border-color: var(--color-accent-hover);
  box-shadow: 0 0 14px rgba(255, 160, 102, 0.8), 0 0 24px rgba(230, 195, 132, 0.4);
}

.spine-node-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-accent);
}

.spine-node.is-active .spine-node-dot {
  background: var(--color-accent-hover);
}

/* Experience Card */
.experience-card {
  position: relative;
  width: 44%;
  max-width: 470px;
  background: rgba(42, 42, 55, 0.94);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  padding: 30px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.45);
  z-index: 2;
  will-change: transform, opacity;
}

/* Card Header */
.card-header {
  margin-bottom: 18px;
}

.period-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-accent);
  background: rgba(230, 195, 132, 0.12);
  border: 1px solid rgba(230, 195, 132, 0.3);
  padding: 3px 10px;
  border-radius: 2px;
  margin-bottom: 10px;
}

.role-title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.company-row {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.company-name {
  font-size: 1.02rem;
  font-weight: 600;
  color: var(--color-accent);
}

.location-tag {
  font-size: 0.88rem;
  color: var(--color-text-secondary);
}

/* Highlights List */
.highlights-list {
  list-style: none;
  padding: 0;
  margin: 0 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.highlight-item {
  position: relative;
  font-size: 0.92rem;
  line-height: 1.55;
  color: var(--color-text);
  padding-left: 18px;
}

.highlight-item::before {
  content: '▹';
  position: absolute;
  left: 0;
  top: 0;
  color: var(--color-accent);
  font-weight: bold;
}

.card-desc {
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-text);
  margin: 0 0 20px;
}

/* Tech Stack Badges */
.stack-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-pill {
  font-size: 0.74rem;
  font-weight: 600;
  padding: 3px 8px;
  background: rgba(220, 215, 186, 0.08);
  color: var(--color-text-secondary);
  border: 1px solid rgba(54, 54, 70, 0.7);
  border-radius: 2px;
}

/* Responsive Layout with gsap.matchMedia mobile fallback */
@media (max-width: 820px) {
  .timeline-spine-track {
    left: 20px;
    transform: none;
  }

  .spine-node {
    left: 20px;
  }

  .experience-milestone {
    min-height: auto;
    margin-bottom: 50px;
    justify-content: flex-start !important;
    padding-left: 50px;
  }

  .experience-card {
    width: 100%;
    max-width: 100%;
    padding: 22px;
  }
}
</style>
