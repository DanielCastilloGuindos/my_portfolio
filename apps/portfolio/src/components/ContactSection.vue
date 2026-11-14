<script setup lang="ts">
import { computed, ref } from 'vue';
import { Mail, Linkedin, MapPin, Send } from 'lucide-vue-next';
import type { Profile, ContactInfo } from '@portfolio/core';
import type { Theme } from '../themes/index';
import { prefersReducedMotion } from '../lib/format';

const props = defineProps<{
  contactInfo: ContactInfo | null;
  profile: Profile;
  theme: Theme;
}>();

const FORMSPREE_ENDPOINT = import.meta.env.VITE_FORMSPREE_ENDPOINT ?? '';

const form = ref({
  name: '',
  email: '',
  message: '',
});
const errors = ref<{ name?: string; email?: string; message?: string }>({});
const status = ref<'idle' | 'submitting' | 'success' | 'error'>('idle');
const statusMessage = ref('');

const reducedMotion = prefersReducedMotion();

const emailToShow = computedContactField('email');
const phoneToShow = computedContactField('phone');
const whatsappToShow = computedContactField('whatsapp');
const locationToShow = computedContactField('location');

function computedContactField(field: 'email' | 'phone' | 'whatsapp' | 'location'): string | undefined {
  return props.contactInfo?.[field] ?? props.profile[field];
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function validate(): boolean {
  const next: { name?: string; email?: string; message?: string } = {};
  let valid = true;

  if (!form.value.name.trim()) {
    next.name = 'El nombre es requerido.';
    valid = false;
  }
  if (!form.value.email.trim()) {
    next.email = 'El correo es requerido.';
    valid = false;
  } else if (!isValidEmail(form.value.email)) {
    next.email = 'Ingresa un correo válido.';
    valid = false;
  }
  if (!form.value.message.trim()) {
    next.message = 'El mensaje es requerido.';
    valid = false;
  } else if (form.value.message.trim().length < 10) {
    next.message = 'El mensaje es demasiado corto (mínimo 10 caracteres).';
    valid = false;
  }

  errors.value = next;
  return valid;
}

function focusFirstError(): void {
  const first = ['name', 'email', 'message'].find((field) => errors.value[field]);
  if (!first) return;
  const input = document.querySelector<HTMLElement>(`[name="${first}"]`);
  input?.focus();
}

async function submit(event: Event): Promise<void> {
  event.preventDefault();
  if (!validate()) {
    focusFirstError();
    return;
  }

  status.value = 'submitting';
  statusMessage.value = 'Abriendo WhatsApp…';

  const rawPhone = whatsappToShow.value || phoneToShow.value || '+34 605 995 969';
  const cleanPhone = rawPhone.replace(/\D/g, '');

  const textLines = [
    `¡Hola Dani! Te contacto desde tu portfolio danicastillo.es`,
    `Nombre: ${form.value.name.trim()}`,
    `Email: ${form.value.email.trim()}`,
    `Mensaje: ${form.value.message.trim()}`,
  ];
  const messageText = textLines.join('\n\n');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  // Open WhatsApp directly in new window/tab
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

  status.value = 'success';
  statusMessage.value = 'Mensaje preparado. Se ha abierto WhatsApp para enviarlo.';
  form.value = { name: '', email: '', message: '' };
  errors.value = {};
  status.value = 'idle';
}
</script>

<template>
  <section
    id="contacto"
    class="contact"
    aria-labelledby="contacto-heading"
    :style="{ backgroundColor: theme.cssVariables['--color-bg'] }"
  >
    <h2 class="section-title" id="contacto-heading">Contacto</h2>

    <div class="contact-grid">
      <!-- Left: contact form -->
      <form @submit.prevent="submit" class="contact-form" novalidate>
        <div class="form-group">
          <label for="contact-name">Nombre</label>
          <input
            id="contact-name"
            name="name"
            type="text"
            inputmode="text"
            autocomplete="name"
            v-model="form.name"
            :class="{ invalid: errors.name }"
            placeholder="Tu nombre…"
            :disabled="status === 'submitting'"
          />
          <span v-if="errors.name" class="error-msg">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label for="contact-email">Correo electrónico</label>
          <input
            id="contact-email"
            name="email"
            type="email"
            inputmode="email"
            autocomplete="email"
            v-model="form.email"
            :class="{ invalid: errors.email }"
            placeholder="tucorreo@ejemplo.com"
            :disabled="status === 'submitting'"
          />
          <span v-if="errors.email" class="error-msg">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="contact-message">Mensaje</label>
          <textarea
            id="contact-message"
            name="message"
            v-model="form.message"
            :class="{ invalid: errors.message }"
            rows="5"
            placeholder="¿En qué puedo ayudarte?…"
            :disabled="status === 'submitting'"
          ></textarea>
          <span v-if="errors.message" class="error-msg">{{ errors.message }}</span>
        </div>

        <button
          type="submit"
          class="submit-btn"
          :disabled="status === 'submitting'"
          :aria-busy="status === 'submitting'"
        >
          <span v-if="status === 'submitting'" class="spinner" aria-hidden="true"></span>
          <Send v-else :size="18" class="btn-icon" aria-hidden="true" />
          <span class="btn-label">
            {{ status === 'submitting' ? 'Enviando…' : 'Enviar mensaje' }}
          </span>
        </button>

        <div v-if="status === 'success'" class="form-status success" role="status" aria-live="polite">
          {{ statusMessage }}
        </div>
        <div v-else-if="status === 'error'" class="form-status error" role="alert" aria-live="assertive">
          {{ statusMessage }}
        </div>
      </form>

      <!-- Right: contact info card -->
      <div class="contact-card">
        <h3>Habla conmigo</h3>
        <p>Escríbeme por cualquiera de estos medios.</p>

        <ul class="info-list">
          <li class="info-item">
            <span class="info-icon" title="Correo electrónico" aria-label="Correo electrónico">
              <Mail :size="20" />
            </span>
            <span class="info-value">
              <a :href="`mailto:${emailToShow}`">{{ emailToShow }}</a>
            </span>
          </li>
          <li class="info-item" v-if="whatsappToShow">
            <span class="info-icon whatsapp-icon" title="WhatsApp" aria-label="WhatsApp">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.529 1.83.81 2.788.81 3.181 0 5.768-2.587 5.769-5.766.001-3.182-2.586-5.796-5.767-5.796zm3.385 8.212c-.143.402-.833.771-1.157.818-.323.048-.737.067-2.392-.619-1.996-.827-3.266-2.859-3.366-2.993-.1-.133-.807-1.074-.807-2.049 0-.975.508-1.455.688-1.654.181-.199.395-.249.528-.249.133 0 .266.002.381.008.122.006.284-.046.444.338.165.396.564 1.375.614 1.476.05.101.083.219.016.353-.067.133-.1.217-.199.333-.1.116-.21.26-.3.349-.1.1-.205.209-.089.409.116.2.518.855 1.111 1.383.766.682 1.411.894 1.611.994.2.1.317.088.434-.047.117-.134.5-.584.633-.784.133-.2.267-.167.45-.1.183.067 1.161.548 1.361.648.2.1.333.15.383.234.05.084.05.485-.093.887z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.981-1.306C8.441 21.522 10.165 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18.2c-1.637 0-3.178-.501-4.464-1.365l-.32-.213-2.964.777.791-2.89-.228-.363C3.896 14.825 3.35 13.454 3.35 12c0-4.77 3.88-8.65 8.65-8.65 4.77 0 8.65 3.88 8.65 8.65 0 4.77-3.88 8.65-8.65 8.65z"/>
              </svg>
            </span>
            <a
              :href="`https://wa.me/${whatsappToShow.replace(/\s/g, '')}`"
              target="_blank"
              rel="noopener noreferrer"
              class="info-value"
            >
              {{ whatsappToShow }}
            </a>
          </li>
          <li class="info-item">
            <span class="info-icon linkedin-icon" title="LinkedIn" aria-label="LinkedIn">
              <Linkedin :size="18" />
            </span>
            <a
              href="https://www.linkedin.com/in/dcastilloguindos"
              target="_blank"
              rel="noopener noreferrer"
              class="info-value"
            >
              linkedin.com/in/dcastilloguindos
            </a>
          </li>
          <li class="info-item" v-if="locationToShow">
            <span class="info-icon" title="Ubicación" aria-label="Ubicación">
              <MapPin :size="20" />
            </span>
            <span class="info-value">{{ locationToShow }}</span>
          </li>
        </ul>

        <div class="social-hint" v-if="profile.socialLinks && profile.socialLinks.length">
          <p>También me encuentras en:</p>
          <div class="social-links">
            <a
              v-for="link in profile.socialLinks"
              :key="link.id"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="social-chip"
              :aria-label="`Perfil de ${link.platform}`"
            >
              {{ link.platform }}
            </a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  padding: 120px 0;
}

.section-title {
  text-align: center;
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 80px;
  letter-spacing: -0.04em;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  max-width: 1024px;
  margin: 0 auto;
  align-items: start;
}

.contact-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-text);
}

.form-group input,
.form-group textarea {
  font-size: 1rem;
  padding: 12px 16px;
  border-radius: 0;
  border: 1px solid var(--color-border);
  background: var(--color-bg);
  color: var(--color-text);
  width: 100%;
  box-sizing: border-box;
  touch-action: manipulation;
}

.form-group input:focus-visible,
.form-group textarea:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-color: var(--color-accent);
}

.form-group input.invalid,
.form-group textarea.invalid {
  border-color: #c9a45a;
}

.error-msg {
  font-size: 0.875rem;
  color: #c9a45a;
  margin-top: 4px;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 28px;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-bg);
  background: var(--color-accent);
  border: 1px solid var(--color-accent);
  border-radius: 0;
  cursor: pointer;
  touch-action: manipulation;
  margin-top: 8px;
}

.submit-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.submit-btn:hover:not(:disabled) {
  background: var(--color-accent-hover);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(31, 31, 40, 0.35);
  border-top-color: var(--color-bg);
  border-radius: 0;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.form-status {
  padding: 12px 16px;
  border-radius: 0;
  font-size: 0.95rem;
  font-weight: 600;
  margin-top: 8px;
  border: 1px solid var(--color-border);
}

.form-status.success {
  background: rgba(201, 164, 90, 0.12);
  color: #c9a45a;
  border-color: var(--color-accent);
}

.form-status.error {
  background: rgba(201, 164, 90, 0.12);
  color: #c9a45a;
  border-color: var(--color-accent);
}

.contact-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 0;
  padding: 40px;
  box-shadow: none;
}

.contact-card h3 {
  margin: 0 0 16px;
  font-size: 1.25rem;
  color: var(--color-text);
}

.contact-card p {
  margin: 0 0 32px;
  color: var(--color-text-secondary);
  font-size: 0.95rem;
}

.info-list {
  list-style: none;
  padding: 0;
  margin: 0 0 48px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.info-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md, 2px);
  background: rgba(230, 195, 132, 0.1);
  color: var(--color-accent);
  border: 1px solid rgba(230, 195, 132, 0.2);
  flex-shrink: 0;
}

.info-icon.whatsapp-icon {
  background: rgba(118, 148, 106, 0.12);
  color: #76946A;
  border-color: rgba(118, 148, 106, 0.25);
}

.info-icon.linkedin-icon {
  background: rgba(10, 102, 194, 0.14);
  color: #70b5f9;
  border-color: rgba(10, 102, 194, 0.35);
}

.btn-icon {
  flex-shrink: 0;
}

.info-value {
  color: var(--color-text);
  font-size: 0.95rem;
}

.info-value a {
  color: var(--color-accent);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.social-hint p {
  margin: 0 0 16px;
  font-size: 0.95rem;
  color: var(--color-text-secondary);
  font-weight: 600;
}

.social-links {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.social-chip {
  padding: 10px 20px;
  font-size: 0.875rem;
  font-weight: 600;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 0;
  color: var(--color-text);
  touch-action: manipulation;
}

.social-chip:hover {
  background: var(--color-accent);
  color: var(--color-bg);
  border-color: var(--color-accent);
}

@media (max-width: 768px) {
  .contact {
    padding: 70px 16px 80px;
  }

  .section-title {
    margin: 0 0 36px;
  }

  .contact-grid {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .contact-card {
    padding: 24px 18px;
  }

  .info-value {
    overflow-wrap: break-word;
    word-break: break-word;
  }
}

@media (prefers-reduced-motion: reduce) {
  .spinner {
    animation: none;
    display: none;
  }
}
</style>
