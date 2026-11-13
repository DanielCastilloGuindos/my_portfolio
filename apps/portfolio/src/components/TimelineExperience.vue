<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { Experience, WorkExperience } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';
import { VideoScrubController } from '../lib/video-scrubber';

gsap.registerPlugin(ScrollTrigger);

type ExperienceItem = Experience & WorkExperience;

const props = defineProps<{
  experiences: ExperienceItem[];
  theme: Theme;
}>();

const rootEl = ref<HTMLElement | null>(null);
const timelineWrapperEl = ref<HTMLElement | null>(null);
const spineProgressEl = ref<HTMLElement | null>(null);

const videoA = ref<HTMLVideoElement | null>(null);
const videoB = ref<HTMLVideoElement | null>(null);

let ctx: gsap.Context | null = null;
let mm: gsap.MatchMedia | null = null;
let videoScrubber: VideoScrubController | null = null;
let tiltCleanups: Array<() => void> = [];

/**
 * Initializes 3D Tilt Parallax on .exp-tilt-card wrappers using gsap.quickTo
 */
function setup3DTiltCards(): void {
  tiltCleanups.forEach((cleanup) => cleanup());
  tiltCleanups = [];

  if (
    prefersReducedMotion() ||
    typeof window === 'undefined' ||
    !window.matchMedia('(hover: hover) and (pointer: fine)').matches
  ) {
    return;
  }

  const tiltCards = rootEl.value?.querySelectorAll<HTMLElement>('.exp-tilt-card') ?? [];

  tiltCards.forEach((card) => {
    // Isolated quickTo setters for rotationX & rotationY
    const rxTo = gsap.quickTo(card, 'rotationX', { duration: 0.45, ease: 'power2.out' });
    const ryTo = gsap.quickTo(card, 'rotationY', { duration: 0.45, ease: 'power2.out' });

    const onMouseMove = (e: MouseEvent) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5; // -0.5 to 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      // Max tilt: +/- 10 degrees
      ryTo(x * 12);
      rxTo(-y * 12);
    };

    const onMouseLeave = () => {
      rxTo(0);
      ryTo(0);
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);

    tiltCleanups.push(() => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
      gsap.set(card, { rotationX: 0, rotationY: 0 });
    });
  });
}

function initTimeline(): void {
  if (!rootEl.value || !timelineWrapperEl.value) return;

  // Initialize lerp-based video scrubber with dual buffer
  videoScrubber = new VideoScrubController({
    lerpFactor: 0.14,
    crossfadeDuration: 0.65,
  });
  videoScrubber.bindVideos(videoA.value, videoB.value);

  ctx = gsap.context(() => {
    // 1. Overall timeline vertical spine progress drawing (scaleY from top center)
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

    mm.add('(min-width: 0px)', () => {
      const milestones = rootEl.value?.querySelectorAll<HTMLElement>('.experience-milestone') ?? [];

      milestones.forEach((milestone, index) => {
        // Outer wrapper: exclusively animated by ScrollTrigger (y and autoAlpha)
        const scrollNode = milestone.querySelector<HTMLElement>('.exp-scroll-node');
        const node = milestone.querySelector<HTMLElement>('.spine-node');
        const exp = props.experiences[index];
        const videoSrc = exp?.backgroundVideoUrl || exp?.videoUrl;

        if (!scrollNode) return;

        // Set initial state without CSS transition conflicts
        gsap.set(scrollNode, { y: 60, autoAlpha: 0 });

        // Scroll-scrubbed timeline: enters from bottom, centers, leaves top
        const cardTl = gsap.timeline({
          scrollTrigger: {
            trigger: milestone,
            start: 'top 85%',
            end: 'bottom 15%',
            scrub: 1,
            onEnter: () => {
              videoScrubber?.switchVideo(videoSrc);
            },
            onEnterBack: () => {
              videoScrubber?.switchVideo(videoSrc);
            },
            onUpdate: (self) => {
              if (self.isActive && videoSrc) {
                // Non-blocking lerped scrub
                videoScrubber?.setProgress(self.progress);
              }
            },
          },
        });

        // Enter: y: 60 -> y: 0, autoAlpha: 0 -> 1
        cardTl.fromTo(
          scrollNode,
          { y: 60, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 1, ease: 'power1.out' },
        );

        // Center dwell
        cardTl.to(scrollNode, { y: 0, autoAlpha: 1, duration: 0.8 });

        // Exit: y: 0 -> y: -60, autoAlpha: 1 -> 0
        cardTl.to(
          scrollNode,
          { y: -60, autoAlpha: 0, duration: 1, ease: 'power1.in' },
        );

        // Central Node illumination
        if (node) {
          ScrollTrigger.create({
            trigger: milestone,
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

    // 3. Setup 3D Tilt Parallax on inner wrappers
    setup3DTiltCards();
  }, rootEl.value);
}

onMounted(() => {
  nextTick(() => {
    if (prefersReducedMotion()) {
      const scrollNodes = rootEl.value?.querySelectorAll<HTMLElement>('.exp-scroll-node') ?? [];
      scrollNodes.forEach((node) => {
        gsap.set(node, { y: 0, autoAlpha: 1 });
      });
      return;
    }
    initTimeline();
  });
});

onUnmounted(() => {
  tiltCleanups.forEach((cleanup) => cleanup());
  tiltCleanups = [];

  if (mm) {
    mm.revert();
    mm = null;
  }
  if (ctx) {
    ctx.revert();
    ctx = null;
  }
  if (videoScrubber) {
    videoScrubber.destroy();
    videoScrubber = null;
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
    <!-- Pinned Background Video Container with Dual-Layer Lerp Scrubber -->
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
      <div class="video-placeholder"></div>
      <div class="video-overlay-tint"></div>
    </div>

    <div class="container">
      <header class="section-header">
        <span class="section-mono-tag font-mono">// 02. CAREER TRAJECTORY</span>
        <h2 id="experience-heading" class="section-title">Experiencia Laboral</h2>
        <p class="section-subtitle">Ingeniería frontend, arquitectura hexagonal y observabilidad en producción</p>
      </header>

      <!-- Central Zig-Zag Timeline Wrapper -->
      <div ref="timelineWrapperEl" class="timeline-wrapper">
        <!-- Vertical Spine Line Track -->
        <div class="timeline-spine-track" aria-hidden="true">
          <div ref="spineProgressEl" class="timeline-spine-progress"></div>
        </div>

        <!-- Experience Milestones (Odd: Left / Even: Right) -->
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

          <!-- LAYER 1: Scroll-driven Outer Wrapper (Strictly ScrollTrigger: y & autoAlpha) -->
          <div class="exp-scroll-node">
            <!-- LAYER 2: Inner Tilt Card (Isolated for Tilt 3D: rotateX/rotateY) -->
            <article class="exp-tilt-card">
              <!-- Technical Index & Period Tag -->
              <div class="card-meta-top font-mono">
                <span class="exp-index">// 0{{ index + 1 }}</span>
                <span class="period-badge">{{ exp.period || '2021 – Presente' }}</span>
              </div>

              <!-- Header: Role & Company -->
              <div class="card-header">
                <h3 class="role-title">{{ exp.role || exp.position }}</h3>
                <div class="company-row">
                  <span class="company-name">{{ exp.company }}</span>
                  <span v-if="exp.location" class="location-tag font-mono">· {{ exp.location }}</span>
                </div>
              </div>

              <!-- Key Accomplishments -->
              <ul v-if="exp.highlights && exp.highlights.length" class="highlights-list">
                <li v-for="(highlight, hIdx) in exp.highlights" :key="hIdx" class="highlight-item">
                  {{ highlight }}
                </li>
              </ul>
              <p v-else-if="exp.description" class="card-desc">
                {{ exp.description }}
              </p>

              <!-- Tech Stack Badges -->
              <div v-if="exp.stack && exp.stack.length" class="stack-wrapper font-mono">
                <span v-for="tech in exp.stack" :key="tech" class="tech-pill">
                  {{ tech }}
                </span>
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.experience-section {
  position: relative;
  width: 100%;
  padding: 110px 0 130px;
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
  margin-bottom: 75px;
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
  font-family: var(--font-display);
  font-size: 2.35rem;
  font-weight: 700;
  color: var(--color-text);
  margin: 0 0 12px;
  letter-spacing: -0.03em;
}

.section-subtitle {
  font-size: 1.05rem;
  color: var(--color-text-secondary);
  max-width: 580px;
  margin: 0 auto;
  line-height: 1.5;
}

/* Pinned Sticky Video Background */
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
  background: radial-gradient(circle at 50% 40%, rgba(42, 42, 55, 0.72) 0%, rgba(31, 31, 40, 0.97) 100%);
  z-index: -1;
}

.video-overlay-tint {
  position: absolute;
  inset: 0;
  background: rgba(26, 26, 34, 0.76);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Timeline Layout */
.timeline-wrapper {
  position: relative;
  max-width: 1080px;
  margin: 0 auto;
  padding: 20px 0 60px;
}

/* Vertical Spine Track */
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
  box-shadow: 0 0 12px rgba(230, 195, 132, 0.65);
  transform-origin: top center;
  will-change: transform;
}

/* Milestone Item */
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

/* Center Node */
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
  box-shadow: 0 0 16px rgba(255, 160, 102, 0.85), 0 0 24px rgba(230, 195, 132, 0.5);
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

/* Layer 1: Outer Scroll Node (Handled ONLY by GSAP ScrollTrigger) */
.exp-scroll-node {
  position: relative;
  width: 45%;
  max-width: 480px;
  perspective: 1000px;
  z-index: 2;
  will-change: transform, opacity;
}

/* Layer 2: Inner Tilt Card (Isolated for Hover & 3D Tilt) */
.exp-tilt-card {
  position: relative;
  width: 100%;
  background: rgba(38, 38, 50, 0.92);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 2px);
  padding: 32px 30px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.45);
  box-sizing: border-box;
  transform-style: preserve-3d;
  transition: border-color 0.25s ease, box-shadow 0.25s ease;
  will-change: transform;
}

.exp-tilt-card:hover {
  border-color: var(--color-border-hover);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.55);
}

/* Card Metadata Header */
.card-meta-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.exp-index {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--color-accent);
  letter-spacing: 0.08em;
}

.period-badge {
  font-size: 0.74rem;
  font-weight: 600;
  color: var(--color-text-secondary);
  background: rgba(220, 215, 186, 0.08);
  border: 1px solid var(--color-border);
  padding: 3px 8px;
  border-radius: 2px;
}

/* Card Header */
.card-header {
  margin-bottom: 18px;
}

.role-title {
  font-family: var(--font-display);
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
  font-size: 0.84rem;
  color: var(--color-text-secondary);
  opacity: 0.85;
}

/* Highlights List */
.highlights-list {
  list-style: none;
  padding: 0;
  margin: 0 0 22px;
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

/* Stack Badges */
.stack-wrapper {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-pill {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 3px 8px;
  background: rgba(220, 215, 186, 0.06);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 2px;
}

/* Responsive Mobile Layout */
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
    padding-left: 52px;
  }

  .exp-scroll-node {
    width: 100%;
    max-width: 100%;
  }

  .exp-tilt-card {
    padding: 24px 20px;
  }
}
</style>
