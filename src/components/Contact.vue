<template>
  <section class="contact" data-section="contact">
    <div class="contact__header">
      <span class="badge badge-green">{{ data.contact.badge }}</span>
      <h2 class="contact__title">{{ data.contact.title }}</h2>
      <p class="contact__subtitle text-mono">{{ data.contact.subtitle }}</p>
    </div>

    <form class="contact__form glass-strong" @submit.prevent="handleSubmit">
      <div class="form-group" ref="nameGroupRef">
        <label class="form-label text-mono">{{ data.contact.fields.name.label }}</label>
        <div class="form-input-wrapper">
          <input
            v-model="formData.name"
            type="text"
            class="form-input"
            :placeholder="data.contact.fields.name.placeholder"
            required
          />
          <svg class="form-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" stroke="currentColor" stroke-width="2"/>
            <path d="M2 18C2 14.6863 4.68629 12 8 12H12C15.3137 12 18 14.6863 18 18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
      </div>

      <div class="form-group" ref="messageGroupRef">
        <div class="form-label-row">
          <label class="form-label text-mono">{{ data.contact.fields.message.label }}</label>
          <span class="form-counter text-mono">
            MAX. CHARS: {{ data.contact.fields.message.maxChars - formData.message.length }}
          </span>
        </div>
        <textarea
          v-model="formData.message"
          class="form-textarea"
          :placeholder="data.contact.fields.message.placeholder"
          :maxlength="data.contact.fields.message.maxChars"
          rows="6"
          required
        ></textarea>
      </div>

      <div class="contact__actions" ref="actionsRef">
        <button type="button" class="icon-btn" title="Code">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7 14L3 10L7 6M13 6L17 10L13 14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <button type="button" class="icon-btn" title="Email">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M3 4H17C17.5523 4 18 4.44772 18 5V15C18 15.5523 17.5523 16 17 16H3C2.44772 16 2 15.5523 2 15V5C2 4.44772 2.44772 4 3 4Z" stroke="currentColor" stroke-width="2"/>
            <path d="M18 5L10 11L2 5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <button type="submit" class="btn btn-green">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M14.5 6.5C14.5 6.5 14.5 6.5 14.5 6.5L14.5 6.5ZM14.5 6.5L5.5 13.5M14.5 6.5L5.5 13.5M14.5 6.5L5.5 13.5" stroke="currentColor" stroke-width="2"/>
            <path d="M2 8L18 2L12 18L9 11L2 8Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>
          </svg>
          {{ data.contact.button }}
        </button>
      </div>
    </form>

    <div class="contact__decoration">
      <div class="decoration-line decoration-line--1"></div>
      <div class="decoration-line decoration-line--2"></div>
      <div class="decoration-circle decoration-circle--1"></div>
      <div class="decoration-circle decoration-circle--2"></div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import data from '../data.json';

gsap.registerPlugin(ScrollTrigger);

const nameGroupRef = ref<HTMLElement | null>(null);
const messageGroupRef = ref<HTMLElement | null>(null);
const actionsRef = ref<HTMLElement | null>(null);

const formData = reactive({
  name: '',
  message: ''
});

const handleSubmit = () => {
  if (!formData.name || !formData.message) return;

  const message = data.contact.whatsapp.messageTemplate
    .replace('{name}', formData.name)
    .replace('{message}', formData.message);

  const whatsappUrl = `https://wa.me/${data.contact.whatsapp.number}?text=${encodeURIComponent(message)}`;
  
  window.open(whatsappUrl, '_blank');
};

onMounted(() => {
  // Flying assembly animation
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.contact',
      start: 'top center',
      toggleActions: 'play none none reverse'
    }
  });

  tl.from('.contact__header .badge', {
    opacity: 0,
    scale: 0,
    duration: 0.5,
    ease: 'back.out(1.7)'
  })
  .from('.contact__title', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.3')
  .from('.contact__subtitle', {
    opacity: 0,
    duration: 0.4,
    ease: 'power2.out'
  }, '-=0.3')
  .from(nameGroupRef.value, {
    opacity: 0,
    x: -100,
    y: 100,
    rotation: -15,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.2')
  .from(messageGroupRef.value, {
    opacity: 0,
    x: 100,
    y: -100,
    rotation: 15,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.6')
  .from(actionsRef.value?.children || [], {
    opacity: 0,
    y: 50,
    stagger: 0.1,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.4')
  .from('.contact__decoration .decoration-line', {
    scaleX: 0,
    stagger: 0.2,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.5')
  .from('.contact__decoration .decoration-circle', {
    scale: 0,
    opacity: 0,
    stagger: 0.1,
    duration: 0.4,
    ease: 'back.out(1.7)'
  }, '-=0.4');
});
</script>

<style scoped lang="scss">
.contact {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl $spacing-lg;
  position: relative;
  background: linear-gradient(180deg, $bg-primary 0%, darken($bg-primary, 3%) 100%);

  &__header {
    text-align: center;
    margin-bottom: $spacing-2xl;
  }

  &__title {
    font-size: $font-size-5xl;
    margin: $spacing-md 0 $spacing-sm;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-4xl;
    }
  }

  &__subtitle {
    color: $text-muted;
    font-size: $font-size-sm;
  }

  &__form {
    width: 100%;
    max-width: 600px;
    padding: $spacing-2xl;
    border-radius: 1rem;
    position: relative;
    z-index: 1;

    @media (max-width: $breakpoint-md) {
      padding: $spacing-lg;
    }
  }

  &__actions {
    display: flex;
    gap: $spacing-md;
    align-items: center;
  }

  &__decoration {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    z-index: 0;
  }
}

.form-group {
  margin-bottom: $spacing-lg;
}

.form-label {
  display: block;
  color: $accent-green;
  font-size: $font-size-xs;
  margin-bottom: $spacing-sm;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-label-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-sm;
}

.form-counter {
  color: $text-muted;
  font-size: $font-size-xs;
}

.form-input-wrapper {
  position: relative;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: $spacing-md;
  padding-right: $spacing-3xl;
  background: rgba($bg-primary, 0.6);
  border: 1px solid rgba($accent-green, 0.3);
  border-radius: 0.5rem;
  color: $text-primary;
  font-family: $font-mono;
  font-size: $font-size-base;
  transition: all $transition-base $ease-in-out;

  &::placeholder {
    color: $text-muted;
  }

  &:focus {
    outline: none;
    border-color: $accent-green;
    box-shadow: $glow-green-sm;
    background: rgba($bg-primary, 0.8);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
  padding-right: $spacing-md;
}

.form-icon {
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  color: $accent-green;
  opacity: 0.6;
  pointer-events: none;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba($bg-primary, 0.6);
  border: 1px solid rgba($accent-green, 0.3);
  border-radius: 0.5rem;
  color: $text-secondary;
  cursor: pointer;
  transition: all $transition-base $ease-in-out;

  &:hover {
    background: rgba($accent-green, 0.1);
    border-color: $accent-green;
    color: $accent-green;
    box-shadow: $glow-green-sm;
  }
}

.decoration-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, $accent-green, transparent);
  opacity: 0.3;

  &--1 {
    top: 20%;
    left: 0;
    right: 0;
  }

  &--2 {
    bottom: 20%;
    left: 0;
    right: 0;
  }
}

.decoration-circle {
  position: absolute;
  width: 200px;
  height: 200px;
  border: 1px solid rgba($accent-green, 0.2);
  border-radius: 50%;

  &--1 {
    top: 10%;
    left: -100px;
  }

  &--2 {
    bottom: 10%;
    right: -100px;
  }
}
</style>
