<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/format';

const props = defineProps<{
  size?: number;
  accent?: string;
  skin?: string;
}>();

const size = props.size ?? 140;
const accent = props.accent ?? '#c9a45a';
const skin = props.skin ?? '#fcd34d';

const root = ref<HTMLElement | null>(null);
let breathe: gsap.core.Tween | null = null;

/**
 * Monigote copiado tal cual del portfolio anterior
 * (https://github.com/DanielCastilloGuindos/portfolio, src/views/templates/index.hbs)
 * Estructura exacta de divs y border-radius, adaptada a las variables de tema.
 */
onMounted(() => {
  if (prefersReducedMotion() || !root.value) return;

  breathe = gsap.to(root.value, {
    y: -4,
    scale: 1.02,
    duration: 3,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });
});

onUnmounted(() => {
  breathe?.kill();
  breathe = null;
});
</script>

<template>
  <div
    ref="root"
    class="monigote"
    :style="{ width: `${size}px`, height: `${size * 2}px` }"
    aria-label="Person avatar (monigote)"
    role="img"
  >
    <!-- face -->
    <div class="face" :style="{ backgroundColor: skin }">
      <!-- hair -->
      <div class="hair">
        <!-- top hair -->
        <div class="hair-top" />
        <!-- side hair -->
        <div class="hair-side hair-side-left" />
        <div class="hair-side hair-side-right" />
        <!-- sideburns -->
        <div class="sideburn sideburn-left" />
        <div class="sideburn sideburn-right" />
      </div>

      <!-- ears -->
      <div class="ear ear-left" />
      <div class="ear ear-right" />

      <!-- facial expression -->
      <div class="expression">
        <!-- brows -->
        <div class="brows">
          <div class="brow brow-left" />
          <div class="brow brow-right" />
        </div>

        <!-- eyes -->
        <div class="eyes">
          <div class="eye eye-left" />
          <div class="eye eye-right" />
        </div>

        <!-- nose -->
        <div class="nose" :style="{ backgroundColor: skin }" />

        <!-- mouth -->
        <div class="mouth" :style="{ borderColor: accent }" />
      </div>

      <!-- beard & mustache -->
      <div class="beard-mustache">
        <div class="mustache">
          <div class="stache-left" />
          <div class="stache-right" />
        </div>
      </div>
    </div>

    <!-- cuello -->
    <div class="neck" :style="{ backgroundColor: skin }" />

    <!-- Body -->
    <div class="body" :style="{ backgroundColor: accent }" />

    <!-- Arms -->
    <div class="arm arm-left" :style="{ backgroundColor: accent }" />
    <div class="arm arm-right" :style="{ backgroundColor: accent }" />
  </div>
</template>

<style scoped>
.monigote {
  position: relative;
  margin: 0 auto;
  transform-origin: center bottom;
}

/* Face */
.face {
  position: relative;
  width: 100%;
  height: 32%;
  background: var(--color-bg, #fcd34d);
  border-radius: 56% 64% 32% 68% / 76% 0% 100% 24%;
  border: 3px solid var(--color-accent, #ef4444);
  z-index: 3;
}

/* Hair */
.hair {
  position: absolute;
  top: -18%;
  left: 0;
  right: 0;
  height: 16%;
  display: flex;
  justify-content: center;
  z-index: 4;
}

.hair-top {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--color-accent, #ef4444);
  border-radius: 36% 64% 32% 68% / 76% 0% 100% 24%;
}

.hair-side {
  position: absolute;
  top: 20%;
  width: 10%;
  height: 80%;
  background: var(--color-accent, #ef4444);
  border-radius: 77% 23% 89% 11% / 33% 26% 74% 67%;
  box-shadow: 0 0 4px rgba(0,0,0,0.2);
}

.hair-side-left {
  left: -4%;
  transform: rotate(-15deg);
}

.hair-side-right {
  right: -4%;
  transform: rotate(15deg);
}

.sideburn {
  position: absolute;
  top: 55%;
  width: 3%;
  height: 24%;
  background: var(--color-accent, #ef4444);
  border-radius: 11% 89% 21% 79% / 88% 26% 74% 12%;
}

.sideburn-left {
  left: 0;
}

.sideburn-right {
  right: 0;
}

/* Ears */
.ear {
  position: absolute;
  top: 25%;
  width: 10%;
  height: 16%;
  background: var(--color-text-secondary, #fcd34d);
  border: 2px solid var(--color-accent, #ef4444);
  border-right: 0;
  border-radius: 44% 56% 0% 100% / 36% 20% 80% 64%;
  z-index: 3;
}

.ear-left {
  left: -10%;
}

.ear-right {
  right: -10%;
  transform: scaleX(-1);
}

/* Expression */
.expression {
  position: absolute;
  top: 18%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.brows {
  display: flex;
  justify-content: center;
  gap: 16px;
  width: 100%;
}

.brow {
  width: 12%;
  height: 2px;
  background: var(--color-accent, #ef4444);
  border-radius: 88% 12% 98% 2% / 98% 78% 22% 2%;
}

.brow-left {
  transform: rotate(-12deg);
}

.brow-right {
  transform: rotate(6deg);
}

.eyes {
  display: flex;
  justify-content: center;
  gap: 14px;
  width: 100%;
}

.eye {
  width: 6%;
  height: 5%;
  background: #ffffff;
  border-radius: 45% 55% 42% 58% / 51% 53% 47% 49%;
  border: 2px solid var(--color-accent, #ef4444);
  position: relative;
}

.eye::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 40%;
  height: 40%;
  background: var(--color-accent, #ef4444);
  border-radius: 50%;
  transform: translate(-50%, -50%);
}

.nose {
  position: absolute;
  top: 52%;
  left: 50%;
  width: 9%;
  height: 10%;
  background: var(--color-text-secondary, #fcd34d);
  border: 2px solid var(--color-accent, #ef4444);
  border-left: 0;
  border-top: 0;
  transform: translate(-50%, -12%) rotate(-12deg);
  border-radius: 77% 23% 12% 88% / 92% 42% 58% 8%;
}

.mouth {
  position: absolute;
  bottom: 8%;
  left: 50%;
  width: 14%;
  height: 1%;
  border-top: 2.5px solid var(--color-accent, #ef4444);
  border-radius: 50%;
  transform: translateX(-50%);
}

/* Beard & mustache */
.beard-mustache {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 28%;
  display: flex;
  justify-content: center;
  align-items: flex-end;
}

.mustache {
  display: flex;
  gap: 4px;
}

.stache-left,
.stache-right {
  width: 10%;
  height: 2px;
  background: var(--color-accent, #ef4444);
  border-radius: 71% 29% 100% 0% / 100% 47% 53% 0%;
}

.stache-left {
  transform: rotate(-12deg);
}

.stache-right {
  transform: rotate(6deg);
}

/* Neck */
.neck {
  position: absolute;
  top: 32%;
  left: 50%;
  width: 24%;
  height: 56%;
  background: var(--color-text-secondary, #fcd34d);
  border-radius: 49% 51% 48% 52% / 69% 65% 35% 31%;
  transform: translateX(-50%) rotate(6deg);
  z-index: 2;
  box-shadow: inset 0 0 8px rgba(0,0,0,0.1);
}

/* Body */
.body {
  position: absolute;
  top: 88%;
  left: 50%;
  width: 44%;
  height: 12%;
  background: var(--color-accent, #ef4444);
  border-radius: 49% 51% 48% 52% / 69% 65% 35% 31%;
  transform: translateX(-50%);
  z-index: 1;
}

/* Arms */
.arm {
  position: absolute;
  top: 50%;
  width: 14%;
  height: 38%;
  border-radius: 6px;
  z-index: 1;
}

.arm-left {
  left: -8%;
  transform: rotate(-20deg);
  transform-origin: top left;
}

.arm-right {
  right: -8%;
  transform: rotate(20deg);
  transform-origin: top right;
}

@media (prefers-reduced-motion: reduce) {
  .monigote {
    animation: none !important;
    transition: none !important;
  }
}
</style>
