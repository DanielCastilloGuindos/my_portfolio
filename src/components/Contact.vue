<template>
  <section class="contact" data-section="contact">
    <div class="contact__header">
      <span class="contact__label text-mono">CONTACT</span>
      <h2 class="contact__title">{{ data.contact.title }}</h2>
    </div>

    <form class="contact__form glass" @submit.prevent="handleSubmit">
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
          <div class="form-icon">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 10C12.2091 10 14 8.20914 14 6C14 3.79086 12.2091 2 10 2C7.79086 2 6 3.79086 6 6C6 8.20914 7.79086 10 10 10Z" stroke="currentColor" stroke-width="2"/>
              <path d="M2 18C2 14.6863 4.68629 12 8 12H12C15.3137 12 18 14.6863 18 18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
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
        <button type="submit" class="btn btn-primary btn-block">
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import data from '@/data.json';

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

  tl.from('.contact__label', {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'power2.out'
  })
  .from('.contact__title', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    ease: 'power3.out'
  }, '-=0.3')
  .from(nameGroupRef.value, {
    opacity: 0,
    x: -30,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4')
  .from(messageGroupRef.value, {
    opacity: 0,
    x: 30,
    duration: 0.6,
    ease: 'power2.out'
  }, '-=0.4')
  .from(actionsRef.value, {
    opacity: 0,
    y: 20,
    duration: 0.5,
    ease: 'power2.out'
  }, '-=0.3');
});
</script>

<style scoped lang="scss">
@use "sass:color";

.contact {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-3xl $spacing-lg;
  position: relative;

  &__header {
    text-align: center;
    margin-bottom: $spacing-2xl;
    position: relative;
    z-index: 2;
  }

  &__label {
    display: block;
    color: $accent-blue;
    font-size: $font-size-sm;
    letter-spacing: 0.2em;
    margin-bottom: $spacing-xs;
  }

  &__title {
    font-size: $font-size-5xl;
    font-weight: $font-weight-black;
    background: linear-gradient(135deg, $text-primary 0%, $text-muted 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    
    @media (max-width: $breakpoint-md) {
      font-size: $font-size-3xl;
    }
  }

  &__form {
    width: 100%;
    max-width: 500px;
    padding: $spacing-2xl;
    border-radius: 1rem;
    position: relative;
    z-index: 1;

    @media (max-width: $breakpoint-md) {
      padding: $spacing-lg;
    }
  }

  &__actions {
    margin-top: $spacing-xl;
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
  color: $accent-blue;
  font-size: $font-size-xs;
  margin-bottom: $spacing-sm;
  text-transform: uppercase;
  letter-spacing: 0.1em;
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
  padding-right: $spacing-2xl;
  background: rgba($bg-primary, 0.4);
  border: 1px solid rgba($border-primary, 0.5);
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
    border-color: $accent-blue;
    box-shadow: $glow-blue-sm;
    background: rgba($bg-primary, 0.6);
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.form-icon {
  position: absolute;
  right: $spacing-md;
  top: 50%;
  transform: translateY(-50%);
  color: $accent-blue;
  opacity: 0.5;
  pointer-events: none;
  display: flex;
}

.btn-block {
  width: 100%;
  padding: $spacing-md;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: $spacing-sm;
}

.decoration-line {
  position: absolute;
  height: 1px;
  background: linear-gradient(90deg, transparent, $accent-blue, transparent);
  opacity: 0.1;

  &--1 { top: 30%; left: -20%; width: 140%; transform: rotate(15deg); }
  &--2 { bottom: 30%; left: -20%; width: 140%; transform: rotate(-15deg); }
}

.decoration-circle {
  position: absolute;
  width: 400px;
  height: 400px;
  border: 1px solid rgba($accent-blue, 0.05);
  border-radius: 50%;

  &--1 { top: -100px; right: -100px; }
}
</style>
