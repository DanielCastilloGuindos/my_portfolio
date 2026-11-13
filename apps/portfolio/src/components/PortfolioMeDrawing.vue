<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import gsap from 'gsap';
import { prefersReducedMotion } from '../lib/format';

export type DrawingExpression = 'default' | 'cv-hover' | 'whatsapp-hover';

const props = withDefaults(
  defineProps<{
    scale?: number;
    expression?: DrawingExpression;
  }>(),
  {
    scale: 1.8,
    expression: 'default',
  },
);

const root = ref<HTMLElement | null>(null);
let breathe: gsap.core.Tween | null = null;

onMounted(() => {
  if (prefersReducedMotion() || !root.value) return;

  breathe = gsap.to(root.value, {
    y: -5,
    scale: props.scale * 1.02,
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
  <div class="drawing-wrapper" role="img" aria-label="Retrato ilustrado de Danny Castillo">
    <div
      ref="root"
      class="me-drawing"
      :class="[`expr-${expression}`]"
      :style="{ transform: `scale(${scale})` }"
    >
      <div class="me-container">
        <!-- Body -->
        <div class="me-body"></div>

        <!-- Neck -->
        <div class="me-neck"></div>

        <!-- Face -->
        <div class="me-face">
          <!-- Hair -->
          <div class="me-hair">
            <div class="me-hair-top"></div>
            <div class="me-hair-side"></div>
            <div class="me-hair-sideburns"></div>
          </div>

          <!-- Ears -->
          <div class="me-ears">
            <div class="me-ear-left"></div>
          </div>

          <!-- Facial expression -->
          <div class="me-expression">
            <!-- Brows -->
            <div class="me-brows">
              <div class="me-brow me-brow-left"></div>
              <div class="me-brow me-brow-right"></div>
            </div>

            <!-- Eyes -->
            <div class="me-eyes">
              <div class="me-eye me-eye-left"></div>
              <div class="me-eye me-eye-right"></div>
            </div>

            <!-- Nose -->
            <div class="me-nose"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drawing-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 260px;
}

.me-drawing {
  position: relative;
  transform-origin: center center;
  transition: transform 0.2s ease;
}

.me-container {
  position: relative;
  width: 8rem;
  height: 9rem;
}

/* Body / Shirt */
.me-body {
  position: absolute;
  left: -3rem;
  width: 8rem;
  height: 3.5rem;
  margin-top: 5rem;
  background-color: #14532d;
  border-radius: 49% 51% 48% 52% / 69% 65% 35% 31%;
}

/* Neck */
.me-neck {
  position: absolute;
  top: 0;
  left: -0.25rem;
  width: 3rem;
  height: 7rem;
  background-color: #fef9c3;
  border-radius: 9999px;
  transform: rotate(6deg);
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.08);
}

/* Face */
.me-face {
  position: relative;
  width: 3.5rem;
  height: 5.25rem;
  background-color: #fef9c3;
  border-top-left-radius: 9999px;
  border-top-right-radius: 9999px;
  border-bottom-left-radius: 9999px;
  transform: rotate(-6deg);
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.12), 0 1px 2px -1px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

/* Hair */
.me-hair {
  position: absolute;
  top: -0.75rem;
  left: 0;
  width: 4rem;
  height: 1.25rem;
}

.me-hair-top {
  width: 100%;
  height: 100%;
  background-color: #7f1d1d;
  border-radius: 36% 64% 32% 68% / 76% 0% 100% 24%;
}

.me-hair-side {
  position: absolute;
  top: 1rem;
  left: -0.5rem;
  width: 1rem;
  height: 2rem;
  background-color: #7f1d1d;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 77% 23% 89% 11% / 33% 26% 74% 67%;
}

.me-hair-sideburns {
  position: absolute;
  top: 2.25rem;
  left: 0;
  width: 0.25rem;
  height: 1.5rem;
  background-color: #7f1d1d;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  border-radius: 11% 89% 21% 79% / 88% 26% 74% 12%;
}

/* Ears */
.me-ears {
  position: relative;
}

.me-ear-left {
  position: absolute;
  top: 1.75rem;
  left: -1.25rem;
  width: 1.25rem;
  height: 2rem;
  background-color: #fef9c3;
  border: 1px solid #000000;
  border-right: 0;
  border-radius: 44% 56% 0% 100% / 36% 20% 80% 64%;
}

/* Facial expression */
.me-expression {
  position: absolute;
  top: 1.25rem;
  right: -0.5rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.2rem;
}

/* Brows */
.me-brows {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.me-brow {
  width: 1rem;
  height: 0.4rem;
  background-color: #7f1d1d;
  transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
  will-change: transform;
}

.me-brow-left {
  transform: rotate(-12deg);
  border-radius: 88% 12% 98% 2% / 98% 78% 22% 2%;
}

.me-brow-right {
  transform: rotate(6deg);
  border-radius: 18% 82% 0% 100% / 58% 95% 5% 42%;
}

/* Eyes */
.me-eyes {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: space-around;
}

.me-eye {
  width: 0.25rem;
  background-color: #000000;
  transition: transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), height 0.22s ease, border-radius 0.22s ease;
  will-change: transform;
}

.me-eye-left {
  height: 0.6rem;
  border-radius: 45% 55% 42% 58% / 51% 53% 47% 49%;
}

.me-eye-right {
  height: 0.5rem;
  border-radius: 45% 55% 42% 58% / 51% 53% 47% 49%;
}

/* Nose */
.me-nose {
  position: absolute;
  left: 50%;
  top: 0.75rem;
  width: 0.75rem;
  height: 1.25rem;
  background-color: #fef9c3;
  border: 1px solid #111827;
  border-left: 0;
  border-top: 0;
  transform: rotate(-12deg);
  border-radius: 77% 23% 12% 88% / 92% 42% 58% 8%;
}

/* =========================================================
   DYNAMIC FACIAL MICRO-INTERACTIONS ON HERO BUTTON HOVER
   ========================================================= */

/* 1. CV Hover Expression: Arqueo expresivo de cejas y mirada atenta */
.expr-cv-hover .me-brow-left {
  transform: translateY(-6px) rotate(-20deg) scaleX(1.05);
}

.expr-cv-hover .me-brow-right {
  transform: translateY(-6px) rotate(18deg) scaleX(1.05);
}

.expr-cv-hover .me-eye {
  transform: scale(1.3);
}

.expr-cv-hover .me-face {
  transform: rotate(-2deg) translateY(-2px);
}

/* 2. WhatsApp Hover Expression: Guiño de ojo cómplice 😉 */
.expr-whatsapp-hover .me-eye-right {
  transform: translateY(2px) scaleY(0.2) scaleX(1.3);
  height: 2px;
  border-radius: 9999px;
  background-color: #111827;
}

.expr-whatsapp-hover .me-eye-left {
  transform: scale(1.15);
}

.expr-whatsapp-hover .me-brow-right {
  transform: translateY(-7px) rotate(22deg);
}

.expr-whatsapp-hover .me-brow-left {
  transform: translateY(-2px) rotate(-8deg);
}

.expr-whatsapp-hover .me-face {
  transform: rotate(-8deg) translateY(-1px);
}
</style>
