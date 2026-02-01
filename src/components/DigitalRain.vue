<template>
  <div class="storm-container">
    <canvas ref="canvasRef" class="storm-canvas"></canvas>
    <div class="fog-overlay"></div>
    <div class="noise-overlay"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const canvasRef = ref<HTMLCanvasElement | null>(null);
let animationId: number;

interface Drop {
  x: number;
  y: number;
  length: number;
  speed: number;
  opacity: number;
}

onMounted(() => {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Configuration
  const dropCount = 800;
  const windAngle = 15; // Degrees
  const windRad = (windAngle * Math.PI) / 180;
  let drops: Drop[] = [];

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    initDrops();
  };

  const initDrops = () => {
    drops = [];
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * canvas.width * 1.5 - (canvas.width * 0.25), // Extra width for slanted rain
        y: Math.random() * canvas.height,
        length: Math.random() * 20 + 10,
        speed: Math.random() * 15 + 10,
        opacity: Math.random() * 0.3 + 0.1
      });
    }
  };

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw drops
    ctx.strokeStyle = '#2563eb'; // Base theme color
    ctx.lineWidth = 1;

    drops.forEach(drop => {
      ctx.beginPath();
      ctx.globalAlpha = drop.opacity;
      
      // Calculate slanted line coordinates
      const xEnd = drop.x + Math.sin(windRad) * drop.length;
      const yEnd = drop.y + Math.cos(windRad) * drop.length;
      
      ctx.moveTo(drop.x, drop.y);
      ctx.lineTo(xEnd, yEnd);
      ctx.stroke();

      // Update position
      drop.x += Math.sin(windRad) * drop.speed;
      drop.y += Math.cos(windRad) * drop.speed;

      // Reset when out of bounds
      if (drop.y > canvas.height) {
        drop.y = -drop.length;
        drop.x = Math.random() * canvas.width * 1.5 - (canvas.width * 0.25);
      }
      if (drop.x > canvas.width + 50) {
          drop.x = -50;
      } else if (drop.x < -100) {
          drop.x = canvas.width + 100;
      }
    });

    animationId = requestAnimationFrame(draw);
  };

  window.addEventListener('resize', resize);
  resize();
  draw();

  onUnmounted(() => {
    cancelAnimationFrame(animationId);
    window.removeEventListener('resize', resize);
  });
});
</script>

<style scoped lang="scss">
.storm-container {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  background: $bg-primary;
  overflow: hidden;
  pointer-events: none;
}

.storm-canvas {
  width: 100%;
  height: 100%;
  filter: blur(0.5px); // Slight softness to drops
}

.fog-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    circle at 50% 50%, 
    transparent 0%, 
    rgba($bg-primary, 0.4) 70%, 
    rgba($bg-primary, 0.8) 100%
  );
  pointer-events: none;
}

.noise-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  opacity: 0.03;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
  pointer-events: none;
}
</style>
