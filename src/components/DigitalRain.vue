<template>
  <canvas ref="canvasRef" class="digital-rain"></canvas>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;

const chars = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Set canvas size
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  // Rain configuration
  const fontSize = 14;
  const columns = Math.floor(canvas.width / fontSize);
  const drops: number[] = Array(columns).fill(1);

  const draw = () => {
    // Fade effect
    ctx.fillStyle = 'rgba(10, 14, 26, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw characters
    ctx.fillStyle = '#06b6d4';
    ctx.font = `${fontSize}px monospace`;

    for (let i = 0; i < drops.length; i++) {
      const char = chars[Math.floor(Math.random() * chars.length)];
      const x = i * fontSize;
      const y = drops[i] * fontSize;

      ctx.fillText(char, x, y);

      // Reset drop randomly
      if (y > canvas.height && Math.random() > 0.975) {
        drops[i] = 0;
      }

      drops[i]++;
    }

    animationId = requestAnimationFrame(draw);
  };

  draw();

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  });
});
</script>

<style scoped lang="scss">
.digital-rain {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  opacity: 0.15;
  pointer-events: none;
}
</style>
