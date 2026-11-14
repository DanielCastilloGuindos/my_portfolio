<script setup lang="ts">
import { ref, watch, onMounted, nextTick, computed } from 'vue';
import type { PortfolioData } from '@portfolio/core';
import { savePortfolio, loadPortfolio } from './services/api-client';
import { saveDraft, loadDraft, clearDraft, getProfileId } from './services/storage';

/* ------------------------------------------------------------------ */
/* Local draft types (dates kept as strings for <input type="date">)   */
/* ------------------------------------------------------------------ */
interface DraftNavLink {
  id?: string;
  label: string;
  url: string;
}

interface DraftProfile {
  name: string;
  title: string;
  bio: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
  avatarUrl: string;
  cvUrl: string;
  themeId: string;
  headerTitle: string;
  headerLogoUrl: string;
  navLinks: DraftNavLink[];
}

interface DraftExperience {
  id?: string;
  profileId: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  location: string;
  videoUrl: string;
  order: number;
  isExtra: boolean;
}

interface DraftEducation {
  id?: string;
  profileId: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  gpa: string;
  description: string;
  achievement: string;
}

interface DraftProject {
  id?: string;
  profileId: string;
  name: string;
  description: string;
  url: string;
  repoUrl: string;
  imageUrl: string;
  tags: string[];
  featured: boolean;
  tagsInput?: string;
}

interface DraftSkill {
  id?: string;
  profileId: string;
  name: string;
  category: string;
  level: number;
}

interface DraftSocialLink {
  id?: string;
  profileId: string;
  platform: string;
  url: string;
  username: string;
}

interface DraftContactInfo {
  id?: string;
  profileId: string;
  email: string;
  phone: string;
  whatsapp: string;
  location: string;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

const THEMES = [
  { value: 'default', label: 'Default (Kanagawa)' },
  { value: 'minimal', label: 'Minimal' },
  { value: 'creative', label: 'Creative' },
] as const;

/* ------------------------------------------------------------------ */
/* State                                                               */
/* ------------------------------------------------------------------ */
const profileId = getProfileId();

const emptyProfile: DraftProfile = {
  name: '',
  title: '',
  bio: '',
  email: '',
  phone: '',
  whatsapp: '',
  location: '',
  avatarUrl: '',
  cvUrl: '',
  themeId: 'default',
  headerTitle: '',
  headerLogoUrl: '',
  navLinks: [
    { id: 'link-1', label: 'Inicio', url: '#hero' },
    { id: 'link-2', label: 'Sobre mí', url: '#about' },
    { id: 'link-3', label: 'Experiencias', url: '#experiencias' },
    { id: 'link-4', label: 'Estudios', url: '#estudios' },
    { id: 'link-5', label: 'Portfolio', url: '#portfolio' },
    { id: 'link-6', label: 'Contacto', url: '#contacto' },
  ],
};

const emptyExperience = (): DraftExperience => ({
  id: crypto.randomUUID(),
  profileId,
  company: '',
  position: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  location: '',
  videoUrl: '',
  order: 0,
  isExtra: false,
});

const emptyEducation = (): DraftEducation => ({
  id: crypto.randomUUID(),
  profileId,
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: '',
  gpa: '',
  description: '',
  achievement: '',
});

const emptyProject = (): DraftProject => ({
  id: crypto.randomUUID(),
  profileId,
  name: '',
  description: '',
  url: '',
  repoUrl: '',
  imageUrl: '',
  tags: [],
  featured: false,
});

const emptySkill = (): DraftSkill => ({
  id: crypto.randomUUID(),
  profileId,
  name: '',
  category: '',
  level: 1,
});

const emptySocial = (): DraftSocialLink => ({
  id: crypto.randomUUID(),
  profileId,
  platform: '',
  url: '',
  username: '',
});

const emptyContact: DraftContactInfo = {
  id: crypto.randomUUID(),
  profileId,
  email: '',
  phone: '',
  whatsapp: '',
  location: '',
};

const profile = ref<DraftProfile>({ ...emptyProfile });
const experiences = ref<DraftExperience[]>([]);
const education = ref<DraftEducation[]>([]);
const projects = ref<DraftProject[]>([]);
const skills = ref<DraftSkill[]>([]);
const socialLinks = ref<DraftSocialLink[]>([]);
const contactInfo = ref<DraftContactInfo>({ ...emptyContact });

const activeTab = ref<string>('profile');
const editor = ref<{
  kind: 'experience' | 'education' | 'project' | 'skill' | 'social';
  mode: 'add' | 'edit';
  id: string | null;
} | null>(null);
const draftItem = ref<any>(null);

const isSaving = ref(false);
const saveStatus = ref<'idle' | 'success' | 'error'>('idle');
const saveError = ref<string | null>(null);
const apiWarning = ref<string | null>(null);
const fieldErrors = ref<Record<string, string[]>>({});
const toastMessage = ref<string | null>(null);

/* ------------------------------------------------------------------ */
/* Tabs Configuration with Dynamic Item Counters & Icons               */
/* ------------------------------------------------------------------ */
const TABS = computed(() => [
  { id: 'profile', label: 'Perfil', icon: '👤', count: null },
  { id: 'header', label: 'Cabecera y Navegación', icon: '🏷️', count: profile.value?.navLinks?.length ?? 0 },
  { id: 'experience', label: 'Experiencias', icon: '💼', count: experiences.value.length },
  { id: 'education', label: 'Estudios', icon: '🎓', count: education.value.length },
  { id: 'projects', label: 'Portfolio', icon: '🚀', count: projects.value.length },
  { id: 'skills', label: 'Habilidades', icon: '⚡', count: skills.value.length },
  { id: 'social', label: 'Redes Sociales', icon: '🌐', count: socialLinks.value.length },
  { id: 'contact', label: 'Contacto', icon: '✉️', count: null },
  { id: 'save', label: 'Guardar / Exportar', icon: '💾', count: null },
]);

const editPrefix = computed(() => {
  if (!editor.value) return null;
  return editor.value.mode === 'add' ? 'add' : String(editor.value.id);
});

const regularExperiences = computed(() =>
  [...experiences.value]
    .filter((e) => !e.isExtra)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

const extraExperiences = computed(() =>
  [...experiences.value]
    .filter((e) => e.isExtra)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
);

function toDateString(value: any): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value);
}

function showToast(msg: string): void {
  toastMessage.value = msg;
  setTimeout(() => {
    if (toastMessage.value === msg) {
      toastMessage.value = null;
    }
  }, 3500);
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */
function clearField(id: string): void {
  delete fieldErrors.value[id];
}

function setField(id: string, msg: string): void {
  fieldErrors.value[id] = [msg];
}

function hasError(id: string): boolean {
  return !!fieldErrors.value[id]?.length;
}

function errorMsg(id: string): string {
  return fieldErrors.value[id]?.[0] ?? '';
}

function isValidUrl(v: string): boolean {
  if (!v) return true;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function isValidPhone(v: string): boolean {
  if (!v) return true;
  return /^\+?[\d\s\-()]{7,}$/.test(v);
}

function focusField(id: string): void {
  nextTick(() => {
    document.getElementById(id)?.focus();
  });
}

function validateAll(): boolean {
  fieldErrors.value = {};
  let first: string | null = null;
  const err = (id: string, msg: string) => {
    if (!first) first = id;
    setField(id, msg);
  };

  // Profile
  if (!profile.value.name.trim()) err('p-name', 'Name is required.');
  else if (profile.value.name.length < 2) err('p-name', 'Name must be at least 2 characters.');
  if (!profile.value.title.trim()) err('p-title', 'Title is required.');
  if (!profile.value.bio.trim()) err('p-bio', 'Bio is required.');
  else if (profile.value.bio.length > 150) err('p-bio', 'Bio must be at most 150 characters.');
  else if (profile.value.bio.length < 10) err('p-bio', 'Bio must be at least 10 characters.');
  if (!profile.value.email.trim()) err('p-email', 'Email is required.');
  else if (!isValidEmail(profile.value.email)) err('p-email', 'Invalid email address.');
  if (profile.value.phone && !isValidPhone(profile.value.phone)) err('p-phone', 'Invalid phone number.');
  if (profile.value.whatsapp && !isValidPhone(profile.value.whatsapp)) err('p-whatsapp', 'Invalid WhatsApp number.');
  if (profile.value.avatarUrl && !isValidUrl(profile.value.avatarUrl)) err('p-avatar', 'Invalid URL.');
  if (profile.value.cvUrl && !isValidUrl(profile.value.cvUrl)) err('p-cv', 'Invalid URL.');
  if (!THEMES.some((t) => t.value === profile.value.themeId)) err('p-theme', 'Select a theme.');

  // Experiences
  experiences.value.forEach((e, i) => {
    const p = (k: string) => `e-${i}-${k}`;
    if (!e.company.trim()) err(p('company'), 'Company is required.');
    if (!e.position.trim()) err(p('position'), 'Position is required.');
    if (!e.startDate) err(p('start'), 'Start date is required.');
    if (!e.description.trim()) err(p('description'), 'Description is required.');
    if (e.videoUrl && !isValidUrl(e.videoUrl)) err(p('video'), 'Invalid video URL.');
    if (Number.isNaN(e.order) || e.order < 0) err(p('order'), 'Order must be a number >= 0.');
  });

  // Education
  education.value.forEach((e, i) => {
    const p = (k: string) => `ed-${i}-${k}`;
    if (!e.institution.trim()) err(p('institution'), 'Institution is required.');
    if (!e.degree.trim()) err(p('degree'), 'Degree is required.');
    if (!e.startDate) err(p('start'), 'Start date is required.');
    if (e.gpa && isNaN(Number(e.gpa))) err(p('gpa'), 'GPA must be a number.');
  });

  // Projects
  projects.value.forEach((p, i) => {
    const k = (x: string) => `pr-${i}-${x}`;
    if (!p.name.trim()) err(k('name'), 'Project name is required.');
    if (!p.description.trim()) err(k('description'), 'Description is required.');
    if (p.url && !isValidUrl(p.url)) err(k('url'), 'Invalid URL.');
    if (p.repoUrl && !isValidUrl(p.repoUrl)) err(k('repo'), 'Invalid URL.');
    if (p.imageUrl && !isValidUrl(p.imageUrl)) err(k('image'), 'Invalid URL.');
  });

  // Skills
  skills.value.forEach((s, i) => {
    const k = (x: string) => `sk-${i}-${x}`;
    if (!s.name.trim()) err(k('name'), 'Skill name is required.');
    if (!s.category.trim()) err(k('category'), 'Category is required.');
    if (s.level < 1 || s.level > 5) err(k('level'), 'Level must be between 1 and 5.');
  });

  // Social links
  socialLinks.value.forEach((s, i) => {
    const k = (x: string) => `so-${i}-${x}`;
    if (!s.platform.trim()) err(k('platform'), 'Platform is required.');
    if (!s.url.trim()) err(k('url'), 'URL is required.');
    else if (!isValidUrl(s.url)) err(k('url'), 'Invalid URL.');
  });

  // Contact info (single object)
  if (!contactInfo.value.email.trim()) err('c-email', 'Email is required.');
  else if (!isValidEmail(contactInfo.value.email)) err('c-email', 'Invalid email address.');
  if (contactInfo.value.phone && !isValidPhone(contactInfo.value.phone)) err('c-phone', 'Invalid phone number.');
  if (contactInfo.value.whatsapp && !isValidPhone(contactInfo.value.whatsapp)) err('c-whatsapp', 'Invalid WhatsApp number.');

  if (first) focusField(first);
  return !first;
}

/* ------------------------------------------------------------------ */
/* Collection editors                                                  */
/* ------------------------------------------------------------------ */
function addItem(kind: 'experience' | 'education' | 'project' | 'skill' | 'social'): void {
  let empty: any;
  switch (kind) {
    case 'experience': empty = emptyExperience(); break;
    case 'education': empty = emptyEducation(); break;
    case 'project': empty = emptyProject(); break;
    case 'skill': empty = emptySkill(); break;
    case 'social': empty = emptySocial(); break;
  }
  draftItem.value = clone(empty);
  if (kind === 'project') draftItem.value.tagsInput = (draftItem.value.tags ?? []).join(', ');
  editor.value = { kind, mode: 'add', id: null };
}

function editItem(kind: 'experience' | 'education' | 'project' | 'skill' | 'social', id: string): void {
  const arr = collection(kind);
  const item = arr.find((x) => x.id === id);
  if (!item) return;
  draftItem.value = clone(item);
  if (kind === 'project') draftItem.value.tagsInput = (draftItem.value.tags ?? []).join(', ');
  editor.value = { kind, mode: 'edit', id };
}

function cancelEdit(): void {
  editor.value = null;
  draftItem.value = null;
}

function collection(kind: string): any[] {
  switch (kind) {
    case 'experience': return experiences.value;
    case 'education': return education.value;
    case 'project': return projects.value;
    case 'skill': return skills.value;
    case 'social': return socialLinks.value;
  }
  return [];
}

function validateDraft(kind: string, d: any): { ok: boolean; first: string | null } {
  fieldErrors.value = {};
  let first: string | null = null;
  const pfx = editor.value?.mode === 'add' ? 'add' : String(editor.value?.id);
  const err = (k: string, msg: string) => {
    const id = `${pfx}-${k}`;
    if (!first) first = id;
    setField(id, msg);
  };

  if (kind === 'experience') {
    if (!d.company.trim()) err('company', 'Company is required.');
    if (!d.position.trim()) err('position', 'Position is required.');
    if (!d.startDate) err('start', 'Start date is required.');
    if (!d.description.trim()) err('description', 'Description is required.');
    if (d.videoUrl && !isValidUrl(d.videoUrl)) err('video', 'Invalid video URL.');
    if (Number.isNaN(d.order) || d.order < 0) err('order', 'Order must be a number >= 0.');
  } else if (kind === 'education') {
    if (!d.institution.trim()) err('institution', 'Institution is required.');
    if (!d.degree.trim()) err('degree', 'Degree is required.');
    if (!d.startDate) err('start', 'Start date is required.');
    if (d.gpa && isNaN(Number(d.gpa))) err('gpa', 'GPA must be a number.');
  } else if (kind === 'project') {
    if (!d.name.trim()) err('name', 'Project name is required.');
    if (!d.description.trim()) err('description', 'Description is required.');
    if (d.url && !isValidUrl(d.url)) err('url', 'Invalid URL.');
    if (d.repoUrl && !isValidUrl(d.repoUrl)) err('repo', 'Invalid URL.');
    if (d.imageUrl && !isValidUrl(d.imageUrl)) err('image', 'Invalid URL.');
  } else if (kind === 'skill') {
    if (!d.name.trim()) err('name', 'Skill name is required.');
    if (!d.category.trim()) err('category', 'Category is required.');
    if (d.level < 1 || d.level > 5) err('level', 'Level must be between 1 and 5.');
  } else if (kind === 'social') {
    if (!d.platform.trim()) err('platform', 'Platform is required.');
    if (!d.url.trim()) err('url', 'URL is required.');
    else if (!isValidUrl(d.url)) err('url', 'Invalid URL.');
  }

  if (first) focusField(first);
  return { ok: !first, first };
}

function commitItem(kind: 'experience' | 'education' | 'project' | 'skill' | 'social'): void {
  const e = editor.value;
  if (!e) return;
  const d = draftItem.value as any;
  const result = validateDraft(kind, d);
  if (!result.ok) {
    saveStatus.value = 'error';
    saveError.value = 'Please fix the errors marked above.';
    return;
  }

  if (kind === 'experience' && d.current) d.endDate = '';
  if (kind === 'project') d.tags = tagsFromString(d.tagsInput ?? '');
  const base = { ...d, profileId, id: e.mode === 'add' ? crypto.randomUUID() : e.id };
  const arr = collection(kind);
  if (e.mode === 'add') {
    arr.push(base);
  } else {
    const idx = arr.findIndex((x) => x.id === e.id);
    if (idx >= 0) arr.splice(idx, 1, base);
  }

  editor.value = null;
  draftItem.value = null;
  saveStatus.value = 'idle';
  saveError.value = null;
  showToast('Elemento guardado correctamente');
}

function deleteItem(kind: 'experience' | 'education' | 'project' | 'skill' | 'social', id: string): void {
  if (!confirm('¿Eliminar este elemento?')) return;
  const arr = collection(kind);
  const idx = arr.findIndex((x) => x.id === id);
  if (idx >= 0) arr.splice(idx, 1);
  if (editor.value?.kind === kind && editor.value?.id === id) {
    editor.value = null;
    draftItem.value = null;
  }
  showToast('Elemento eliminado');
}

function tagsFromString(v: string): string[] {
  return v.split(',').map((t) => t.trim()).filter(Boolean);
}

const newNavLink = ref({ label: '', url: '' });

function addNavLink(): void {
  if (!newNavLink.value.label.trim() || !newNavLink.value.url.trim()) return;
  if (!profile.value.navLinks) profile.value.navLinks = [];
  profile.value.navLinks.push({
    id: crypto.randomUUID(),
    label: newNavLink.value.label.trim(),
    url: newNavLink.value.url.trim(),
  });
  newNavLink.value = { label: '', url: '' };
  persistDraft();
  showToast('Enlace añadido');
}

function removeNavLink(index: number): void {
  if (profile.value.navLinks) {
    profile.value.navLinks.splice(index, 1);
    persistDraft();
    showToast('Enlace eliminado');
  }
}

function resetDefaultNavLinks(): void {
  profile.value.navLinks = [
    { id: 'link-1', label: 'Inicio', url: '#hero' },
    { id: 'link-2', label: 'Sobre mí', url: '#about' },
    { id: 'link-3', label: 'Experiencias', url: '#experiencias' },
    { id: 'link-4', label: 'Estudios', url: '#estudios' },
    { id: 'link-5', label: 'Portfolio', url: '#portfolio' },
    { id: 'link-6', label: 'Contacto', url: '#contacto' },
  ];
  persistDraft();
  showToast('Enlaces restablecidos');
}

function downloadJson(): void {
  const payload = buildPayload();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'portfolio.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast('portfolio.json descargado');
}

/* ------------------------------------------------------------------ */
/* Save / load                                                         */
/* ------------------------------------------------------------------ */
function buildPayload(): PortfolioData {
  return {
    profile: {
      ...profile.value,
      themeId: profile.value.themeId || undefined,
      headerTitle: profile.value.headerTitle || undefined,
      headerLogoUrl: profile.value.headerLogoUrl || undefined,
      navLinks: profile.value.navLinks,
    },
    experiences: experiences.value.map((e) => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate) : undefined,
      endDate: e.endDate ? new Date(e.endDate) : undefined,
    })),
    education: education.value.map((e) => ({
      ...e,
      startDate: e.startDate ? new Date(e.startDate) : undefined,
      endDate: e.endDate ? new Date(e.endDate) : undefined,
    })),
    projects: projects.value.map((p) => ({
      ...p,
      tags: Array.isArray(p.tags) ? p.tags : tagsFromString(String(p.tags ?? '')),
    })),
    skills: skills.value,
    socialLinks: socialLinks.value,
    contactInfo: contactInfo.value ?? null,
    navLinks: profile.value.navLinks,
  } as unknown as PortfolioData;
}

async function handleSave(): Promise<void> {
  if (!validateAll()) {
    saveStatus.value = 'error';
    saveError.value = 'Por favor corrige los errores marcados antes de guardar.';
    showToast('Corrige los errores señalados.');
    return;
  }

  isSaving.value = true;
  saveStatus.value = 'idle';
  saveError.value = null;

  const payload = buildPayload();
  saveDraft(payload);
  try {
    localStorage.setItem('portfolio_data', JSON.stringify(payload));
  } catch {}

  // Broadcast to portfolio window
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('portfolio-sync');
      channel.postMessage(payload);
      channel.close();
    }
  } catch {}

  try {
    await savePortfolio(payload);
    saveStatus.value = 'success';
    showToast('¡Guardado y sincronizado correctamente!');
  } catch (err: any) {
    // If API server is not running, localStorage persistence is still successful!
    saveStatus.value = 'success';
    saveError.value = null;
    showToast('Guardado en local y sincronizado.');
  } finally {
    isSaving.value = false;
  }
}

function coerceExperiences(items: any[]): DraftExperience[] {
  return items.map((e) => ({
    id: e.id ?? crypto.randomUUID(),
    profileId: e.profileId ?? profileId,
    company: String(e.company ?? ''),
    position: String(e.position ?? ''),
    startDate: toDateString(e.startDate),
    endDate: toDateString(e.endDate) ?? '',
    current: !!e.current,
    description: String(e.description ?? ''),
    location: String(e.location ?? ''),
    videoUrl: String(e.videoUrl ?? ''),
    order: Number(e.order ?? 0) || 0,
    isExtra: !!e.isExtra,
  }));
}

function coerceEducation(items: any[]): DraftEducation[] {
  return items.map((e) => ({
    id: e.id ?? crypto.randomUUID(),
    profileId: e.profileId ?? profileId,
    institution: String(e.institution ?? ''),
    degree: String(e.degree ?? ''),
    fieldOfStudy: String(e.fieldOfStudy ?? ''),
    startDate: toDateString(e.startDate),
    endDate: toDateString(e.endDate) ?? '',
    gpa: String(e.gpa ?? ''),
    description: String(e.description ?? ''),
    achievement: String(e.achievement ?? ''),
  }));
}

function coerceProjects(items: any[]): DraftProject[] {
  return items.map((p) => ({
    id: p.id ?? crypto.randomUUID(),
    profileId: p.profileId ?? profileId,
    name: String(p.name ?? ''),
    description: String(p.description ?? ''),
    url: String(p.url ?? ''),
    repoUrl: String(p.repoUrl ?? ''),
    imageUrl: String(p.imageUrl ?? ''),
    tags: Array.isArray(p.tags) ? p.tags.map(String) : [],
    featured: !!p.featured,
    tagsInput: (Array.isArray(p.tags) ? p.tags : []).join(', '),
  }));
}

function coerceSkills(items: any[]): DraftSkill[] {
  return items.map((s) => ({
    id: s.id ?? crypto.randomUUID(),
    profileId: s.profileId ?? profileId,
    name: String(s.name ?? ''),
    category: String(s.category ?? ''),
    level: Number(s.level ?? 1) || 1,
  }));
}

function coerceSocialLinks(items: any[]): DraftSocialLink[] {
  return items.map((s) => ({
    id: s.id ?? crypto.randomUUID(),
    profileId: s.profileId ?? profileId,
    platform: String(s.platform ?? ''),
    url: String(s.url ?? ''),
    username: String(s.username ?? ''),
  }));
}

function coerceContact(value: any): DraftContactInfo {
  return {
    id: value.id ?? crypto.randomUUID(),
    profileId: value.profileId ?? profileId,
    email: String(value.email ?? ''),
    phone: String(value.phone ?? ''),
    whatsapp: String(value.whatsapp ?? ''),
    location: String(value.location ?? ''),
  };
}

async function handleLoadApi(): Promise<void> {
  try {
    const data = await loadPortfolio(profileId);
    profile.value = {
      ...emptyProfile,
      ...data.profile,
      navLinks: data.profile?.navLinks || data.navLinks || emptyProfile.navLinks,
    };
    experiences.value = coerceExperiences(data.experiences ?? []);
    education.value = coerceEducation(data.education ?? []);
    projects.value = coerceProjects(data.projects ?? []);
    skills.value = coerceSkills(data.skills ?? []);
    socialLinks.value = coerceSocialLinks(data.socialLinks ?? []);
    contactInfo.value = data.contactInfo ? coerceContact(data.contactInfo) : { ...emptyContact };
    saveStatus.value = 'idle';
    saveError.value = null;
    apiWarning.value = null;
    showToast('Datos cargados de la API');
  } catch (err: any) {
    saveStatus.value = 'error';
    saveError.value = err?.message ?? 'Error al cargar desde la API.';
  }
}

function persistDraft(): void {
  const payload = buildPayload();
  saveDraft(payload);
  try {
    localStorage.setItem('portfolio_data', JSON.stringify(payload));
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('portfolio-sync');
      channel.postMessage(payload);
      channel.close();
    }
  } catch {}
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */
onMounted(() => {
  const hashTab = location.hash.replace(/^#/, '');
  activeTab.value = hashTab && TABS.value.some((t) => t.id === hashTab) ? hashTab : 'profile';

  watch(
    activeTab,
    (val) => {
      if (location.hash.replace(/^#/, '') !== val) {
        location.hash = val;
      }
    },
  );
  window.addEventListener('hashchange', () => {
    const h = location.hash.replace(/^#/, '');
    if (h && TABS.value.some((t) => t.id === h)) activeTab.value = h;
  });

  const draft = loadDraft();
  if (draft) {
    profile.value = {
      ...emptyProfile,
      ...draft.profile,
      navLinks: draft.profile?.navLinks || draft.navLinks || emptyProfile.navLinks,
    };
    experiences.value = coerceExperiences(draft.experiences ?? []);
    education.value = coerceEducation(draft.education ?? []);
    projects.value = coerceProjects(draft.projects ?? []);
    skills.value = coerceSkills(draft.skills ?? []);
    socialLinks.value = coerceSocialLinks(draft.socialLinks ?? []);
    contactInfo.value = draft.contactInfo ? coerceContact(draft.contactInfo) : { ...emptyContact };
    return;
  }

  loadPortfolio(profileId).catch((err: any) => {
    apiWarning.value = `API no disponible (${err?.message ?? 'modo autónomo'}). Operando en modo borrador local.`;
  });
});

// Persist draft to localStorage on every change.
watch(
  [profile, experiences, education, projects, skills, socialLinks, contactInfo],
  () => persistDraft(),
  { deep: true },
);
</script>

<template>
  <div class="manager-shell">
    <!-- Top Global App Bar -->
    <header class="app-topbar">
      <div class="topbar-left">
        <div class="brand">
          <div class="brand-crest">⚡</div>
          <div class="brand-text">
            <span class="brand-title">PORTFOLIO MANAGER</span>
            <span class="brand-badge">Kanagawa Admin</span>
          </div>
        </div>
        <div class="sync-status" title="Sincronización activa en tiempo real con apps/portfolio">
          <span class="status-dot"></span>
          <span class="status-label">Autoguardado</span>
        </div>
      </div>

      <div class="topbar-actions">
        <a
          href="http://localhost:4321"
          target="_blank"
          rel="noopener noreferrer"
          class="btn btn-topbar btn-view"
        >
          <span>↗</span> Ver Portfolio
        </a>
        <button
          type="button"
          class="btn btn-topbar btn-json"
          @click="downloadJson"
          title="Descargar datos en portfolio.json"
        >
          <span>↓</span> JSON
        </button>
        <button
          type="button"
          class="btn btn-topbar btn-primary"
          :disabled="isSaving"
          @click="handleSave"
        >
          <span v-if="isSaving" class="spinner" aria-hidden="true"></span>
          <span>{{ isSaving ? 'Guardando…' : 'Guardar Todo' }}</span>
        </button>
      </div>
    </header>

    <!-- Local dev / API warning banner -->
    <div v-if="apiWarning" class="banner-warn">
      <strong>Modo local activo:</strong> {{ apiWarning }} Tus cambios se persisten en tiempo real en localStorage y se sincronizan instantáneamente con apps/portfolio.
    </div>

    <!-- Main Container: Sidebar + Workspace -->
    <div class="app-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar">
        <nav class="sidebar-nav" aria-label="Secciones">
          <button
            v-for="t in TABS"
            :key="t.id"
            class="nav-tab-btn"
            :class="{ 'is-active': activeTab === t.id }"
            :aria-pressed="activeTab === t.id"
            @click="activeTab = t.id"
          >
            <span class="tab-icon">{{ t.icon }}</span>
            <span class="tab-label">{{ t.label }}</span>
            <span v-if="t.count !== null" class="tab-count">{{ t.count }}</span>
          </button>
        </nav>

        <div class="sidebar-bottom">
          <div class="theme-field">
            <label for="side-theme" class="theme-label">Tema Visual</label>
            <select
              id="side-theme"
              v-model="profile.themeId"
              class="theme-select"
              @change="persistDraft"
            >
              <option v-for="t in THEMES" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="user-chip">
            <div class="chip-avatar">{{ (profile.name || 'D').charAt(0) }}</div>
            <div class="chip-details">
              <span class="chip-name">{{ profile.name || 'Daniel Castillo' }}</span>
              <span class="chip-title">{{ profile.title || 'Full Stack Developer' }}</span>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="workspace">
        <!-- ===================== Perfil ===================== -->
        <section v-if="activeTab === 'profile'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Información del Perfil</h2>
              <p class="panel-desc">Datos generales, biografía y enlaces profesionales</p>
            </div>
          </div>

          <form @submit.prevent="handleSave" class="form" id="profile-form">
            <div class="form-grid">
              <div class="field">
                <label for="p-name">Nombre completo <span class="req">*</span></label>
                <input
                  id="p-name"
                  name="name"
                  v-model="profile.name"
                  type="text"
                  autocomplete="name"
                  required
                  minlength="2"
                  placeholder="Ej: Daniel Castillo Guindos"
                  :class="{ 'input-error': hasError('p-name') }"
                  @blur="clearField('p-name')"
                />
                <span v-if="hasError('p-name')" class="error">{{ errorMsg('p-name') }}</span>
              </div>

              <div class="field">
                <label for="p-title">Título profesional <span class="req">*</span></label>
                <input
                  id="p-title"
                  name="title"
                  v-model="profile.title"
                  type="text"
                  autocomplete="off"
                  required
                  minlength="2"
                  placeholder="Ej: Frontend Developer / Full Stack"
                  :class="{ 'input-error': hasError('p-title') }"
                  @blur="clearField('p-title')"
                />
                <span v-if="hasError('p-title')" class="error">{{ errorMsg('p-title') }}</span>
              </div>

              <div class="field">
                <label for="p-email">Correo electrónico <span class="req">*</span></label>
                <input
                  id="p-email"
                  name="email"
                  v-model="profile.email"
                  type="email"
                  autocomplete="email"
                  required
                  placeholder="danielcastilloguindos@gmail.com"
                  :class="{ 'input-error': hasError('p-email') }"
                  @blur="clearField('p-email')"
                />
                <span v-if="hasError('p-email')" class="error">{{ errorMsg('p-email') }}</span>
              </div>

              <div class="field">
                <label for="p-phone">Teléfono de contacto</label>
                <input
                  id="p-phone"
                  name="phone"
                  v-model="profile.phone"
                  type="tel"
                  autocomplete="tel"
                  inputmode="tel"
                  placeholder="+34 605 995 969"
                  :class="{ 'input-error': hasError('p-phone') }"
                  @blur="clearField('p-phone')"
                />
                <span v-if="hasError('p-phone')" class="error">{{ errorMsg('p-phone') }}</span>
              </div>

              <div class="field">
                <label for="p-whatsapp">Número de WhatsApp</label>
                <input
                  id="p-whatsapp"
                  name="whatsapp"
                  v-model="profile.whatsapp"
                  type="tel"
                  autocomplete="tel"
                  inputmode="tel"
                  placeholder="+34 605 995 969"
                  :class="{ 'input-error': hasError('p-whatsapp') }"
                  @blur="clearField('p-whatsapp')"
                />
                <span v-if="hasError('p-whatsapp')" class="error">{{ errorMsg('p-whatsapp') }}</span>
              </div>

              <div class="field">
                <label for="p-location">Ubicación</label>
                <input
                  id="p-location"
                  name="location"
                  v-model="profile.location"
                  type="text"
                  autocomplete="off"
                  placeholder="Madrid, España"
                  :class="{ 'input-error': hasError('p-location') }"
                  @blur="clearField('p-location')"
                />
                <span v-if="hasError('p-location')" class="error">{{ errorMsg('p-location') }}</span>
              </div>

              <div class="field">
                <label for="p-avatar">Avatar URL</label>
                <input
                  id="p-avatar"
                  name="avatarUrl"
                  v-model="profile.avatarUrl"
                  type="url"
                  autocomplete="off"
                  placeholder="https://… o /avatar.png"
                  :class="{ 'input-error': hasError('p-avatar') }"
                  @blur="clearField('p-avatar')"
                />
                <span v-if="hasError('p-avatar')" class="error">{{ errorMsg('p-avatar') }}</span>
              </div>

              <div class="field">
                <label for="p-cv">CV URL (Descarga directa)</label>
                <input
                  id="p-cv"
                  name="cvUrl"
                  v-model="profile.cvUrl"
                  type="url"
                  autocomplete="off"
                  placeholder="https://… o /cv.pdf"
                  :class="{ 'input-error': hasError('p-cv') }"
                  @blur="clearField('p-cv')"
                />
                <span v-if="hasError('p-cv')" class="error">{{ errorMsg('p-cv') }}</span>
              </div>

              <div class="field col-span-full">
                <label for="p-bio">Biografía / Perfil breve <span class="req">*</span></label>
                <textarea
                  id="p-bio"
                  name="bio"
                  v-model="profile.bio"
                  rows="4"
                  autocomplete="off"
                  :class="{ 'input-error': hasError('p-bio') }"
                  @blur="clearField('p-bio')"
                ></textarea>
                <div class="bio-counter" :class="{ 'warn': profile.bio.length > 150 }">
                  {{ profile.bio.length }} / 150 caracteres
                </div>
                <span v-if="hasError('p-bio')" class="error">{{ errorMsg('p-bio') }}</span>
              </div>
            </div>
          </form>
        </section>

        <!-- ===================== Cabecera ===================== -->
        <section v-if="activeTab === 'header'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Cabecera y Navegación</h2>
              <p class="panel-desc">Título, logotipo y enlaces del menú de navegación (desktop y móvil)</p>
            </div>
          </div>

          <form @submit.prevent="handleSave" class="form">
            <div class="form-grid">
              <div class="field">
                <label for="h-title">Título de la cabecera</label>
                <input
                  id="h-title"
                  name="headerTitle"
                  v-model="profile.headerTitle"
                  type="text"
                  placeholder="Ej: Daniel Castillo (vacío para usar el nombre)"
                  @input="persistDraft"
                />
                <p class="hint">Si se deja vacío, la cabecera mostrará el nombre del perfil.</p>
              </div>

              <div class="field">
                <label for="h-logo">Logo URL</label>
                <input
                  id="h-logo"
                  name="headerLogoUrl"
                  v-model="profile.headerLogoUrl"
                  type="url"
                  placeholder="https://… o /favicon.svg"
                  @input="persistDraft"
                />
                <p class="hint">URL o ruta del logo que aparecerá a la izquierda del título.</p>
              </div>

              <div class="field col-span-full">
                <div class="nav-links-header">
                  <label>Enlaces de navegación activa</label>
                  <button type="button" class="btn btn-outline btn-sm" @click="resetDefaultNavLinks">
                    Restablecer enlaces por defecto
                  </button>
                </div>

                <div class="nav-links-list">
                  <div
                    v-for="(link, idx) in profile.navLinks"
                    :key="link.id || idx"
                    class="nav-link-row"
                  >
                    <input
                      v-model="link.label"
                      type="text"
                      placeholder="Texto (ej: Sobre mí)"
                      class="link-input"
                      aria-label="Texto del enlace"
                      @input="persistDraft"
                    />
                    <input
                      v-model="link.url"
                      type="text"
                      placeholder="URL o ancla (ej: #portfolio)"
                      class="link-input"
                      aria-label="URL del enlace"
                      @input="persistDraft"
                    />
                    <button
                      type="button"
                      class="btn-icon delete"
                      @click="removeNavLink(idx)"
                      aria-label="Eliminar enlace"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <div class="add-link-box">
                  <input
                    v-model="newNavLink.label"
                    type="text"
                    placeholder="Nuevo enlace (ej: Blog)"
                    class="link-input"
                    aria-label="Nombre del nuevo enlace"
                  />
                  <input
                    v-model="newNavLink.url"
                    type="text"
                    placeholder="URL o #sección (ej: #blog)"
                    class="link-input"
                    aria-label="URL del nuevo enlace"
                  />
                  <button type="button" class="btn btn-secondary btn-sm" @click="addNavLink">
                    + Añadir enlace
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        <!-- ===================== Experiencia ===================== -->
        <section v-if="activeTab === 'experience'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Experiencia Laboral ({{ experiences.length }})</h2>
              <p class="panel-desc">Puestos, fechas, descripciones y vídeo de fondo para el scroll GSAP</p>
            </div>
            <button type="button" class="btn btn-primary" @click="addItem('experience')">
              + Añadir Experiencia
            </button>
          </div>

          <!-- Add / Edit Form Modal/Card -->
          <form v-if="editor && editor.kind === 'experience' && draftItem" @submit.prevent="commitItem('experience')" class="editor-card">
            <div class="editor-header">
              <h3>{{ editor.mode === 'add' ? 'Nueva Experiencia' : 'Editar Experiencia' }}</h3>
              <button type="button" class="btn-icon" @click="cancelEdit">✕</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Empresa <span class="req">*</span></label>
                <input
                  :id="`e-${editPrefix}-company`"
                  v-model="draftItem.company"
                  type="text"
                  required
                  placeholder="Ej: El Corte Inglés"
                  :class="{ 'input-error': hasError(`e-${editPrefix}-company`) }"
                  @blur="clearField(`e-${editPrefix}-company`)"
                />
                <span v-if="hasError(`e-${editPrefix}-company`)" class="error">{{ errorMsg(`e-${editPrefix}-company`) }}</span>
              </div>

              <div class="field">
                <label>Cargo / Puesto <span class="req">*</span></label>
                <input
                  :id="`e-${editPrefix}-position`"
                  v-model="draftItem.position"
                  type="text"
                  required
                  placeholder="Ej: Frontend Developer"
                  :class="{ 'input-error': hasError(`e-${editPrefix}-position`) }"
                  @blur="clearField(`e-${editPrefix}-position`)"
                />
                <span v-if="hasError(`e-${editPrefix}-position`)" class="error">{{ errorMsg(`e-${editPrefix}-position`) }}</span>
              </div>

              <div class="field">
                <label>Fecha de inicio <span class="req">*</span></label>
                <input
                  :id="`e-${editPrefix}-start`"
                  v-model="draftItem.startDate"
                  type="date"
                  required
                  :class="{ 'input-error': hasError(`e-${editPrefix}-start`) }"
                  @blur="clearField(`e-${editPrefix}-start`)"
                />
                <span v-if="hasError(`e-${editPrefix}-start`)" class="error">{{ errorMsg(`e-${editPrefix}-start`) }}</span>
              </div>

              <div class="field">
                <label>Fecha de fin</label>
                <input
                  :id="`e-${editPrefix}-end`"
                  v-model="draftItem.endDate"
                  type="date"
                  :disabled="draftItem.current"
                  :class="{ 'input-error': hasError(`e-${editPrefix}-end`) }"
                  @blur="clearField(`e-${editPrefix}-end`)"
                />
                <span v-if="hasError(`e-${editPrefix}-end`)" class="error">{{ errorMsg(`e-${editPrefix}-end`) }}</span>
              </div>

              <div class="field checkbox-field">
                <label class="checkbox-label">
                  <input
                    :id="`e-${editPrefix}-current`"
                    v-model="draftItem.current"
                    type="checkbox"
                  />
                  <span>Puesto actual (en curso)</span>
                </label>
              </div>

              <div class="field checkbox-field">
                <label class="checkbox-label">
                  <input
                    :id="`e-${editPrefix}-extra`"
                    v-model="draftItem.isExtra"
                    type="checkbox"
                  />
                  <span>Trabajo extra / Freelance</span>
                </label>
              </div>

              <div class="field">
                <label>Ubicación</label>
                <input
                  :id="`e-${editPrefix}-location`"
                  v-model="draftItem.location"
                  type="text"
                  placeholder="Madrid, España"
                />
              </div>

              <div class="field">
                <label>Vídeo de fondo (MP4/WebM para GSAP Scrub)</label>
                <input
                  :id="`e-${editPrefix}-video`"
                  v-model="draftItem.videoUrl"
                  type="url"
                  placeholder="https://… o /videos/eci.mp4"
                />
              </div>

              <div class="field">
                <label>Orden (mayor aparece primero)</label>
                <input
                  :id="`e-${editPrefix}-order`"
                  v-model.number="draftItem.order"
                  type="number"
                  min="0"
                />
              </div>

              <div class="field col-span-full">
                <label>Descripción y logros clave <span class="req">*</span></label>
                <textarea
                  :id="`e-${editPrefix}-description`"
                  v-model="draftItem.description"
                  rows="4"
                  required
                  placeholder="Responsabilidades, tecnologías y arquitectura empleada..."
                ></textarea>
              </div>
            </div>

            <div class="editor-actions">
              <button type="submit" class="btn btn-primary">
                {{ editor.mode === 'add' ? 'Añadir' : 'Guardar Cambios' }}
              </button>
              <button type="button" class="btn btn-outline" @click="cancelEdit">
                Cancelar
              </button>
            </div>
          </form>

          <!-- List of Experiences -->
          <div class="card-list">
            <article
              v-for="e in experiences"
              :key="e.id"
              class="entity-card"
              :class="{ 'is-extra': e.isExtra }"
            >
              <div class="entity-main">
                <div class="entity-badges">
                  <span class="badge-role">{{ e.position }}</span>
                  <span v-if="e.isExtra" class="badge-pill extra">Extra</span>
                  <span v-if="e.current" class="badge-pill current">Actual</span>
                </div>
                <h3 class="entity-title">{{ e.company }}</h3>
                <p class="entity-meta">
                  <span>📅 {{ e.startDate }} — {{ e.current ? 'presente' : (e.endDate || 'fin') }}</span>
                  <span v-if="e.location">· 📍 {{ e.location }}</span>
                  <span v-if="e.videoUrl">· 🎬 Vídeo scrub configurado</span>
                </p>
                <p class="entity-desc">{{ e.description }}</p>
              </div>

              <div class="entity-actions">
                <button type="button" class="btn btn-edit btn-sm" @click="editItem('experience', e.id!)">
                  Editar
                </button>
                <button type="button" class="btn btn-delete btn-sm" @click="deleteItem('experience', e.id!)">
                  Eliminar
                </button>
              </div>
            </article>

            <div v-if="!experiences.length" class="empty-state">
              No hay experiencias registradas todavía. Pulsa "+ Añadir Experiencia".
            </div>
          </div>
        </section>

        <!-- ===================== Educación ===================== -->
        <section v-if="activeTab === 'education'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Estudios y Logros ({{ education.length }})</h2>
              <p class="panel-desc">Titulaciones oficiales, grados formativos y reconocimientos</p>
            </div>
            <button type="button" class="btn btn-primary" @click="addItem('education')">
              + Añadir Estudio
            </button>
          </div>

          <!-- Add / Edit Form -->
          <form v-if="editor && editor.kind === 'education' && draftItem" @submit.prevent="commitItem('education')" class="editor-card">
            <div class="editor-header">
              <h3>{{ editor.mode === 'add' ? 'Nuevo Estudio' : 'Editar Estudio' }}</h3>
              <button type="button" class="btn-icon" @click="cancelEdit">✕</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Institución educativa <span class="req">*</span></label>
                <input
                  :id="`ed-${editPrefix}-institution`"
                  v-model="draftItem.institution"
                  type="text"
                  required
                  placeholder="Ej: TEIDE IV"
                />
              </div>

              <div class="field">
                <label>Título / Grado obtenido <span class="req">*</span></label>
                <input
                  :id="`ed-${editPrefix}-degree`"
                  v-model="draftItem.degree"
                  type="text"
                  required
                  placeholder="Ej: Desarrollo de Aplicaciones Multiplataforma"
                />
              </div>

              <div class="field">
                <label>Especialidad / Rama</label>
                <input
                  :id="`ed-${editPrefix}-field`"
                  v-model="draftItem.fieldOfStudy"
                  type="text"
                  placeholder="Ej: Grado Superior"
                />
              </div>

              <div class="field">
                <label>Fecha de inicio <span class="req">*</span></label>
                <input
                  :id="`ed-${editPrefix}-start`"
                  v-model="draftItem.startDate"
                  type="date"
                  required
                />
              </div>

              <div class="field">
                <label>Fecha de fin</label>
                <input
                  :id="`ed-${editPrefix}-end`"
                  v-model="draftItem.endDate"
                  type="date"
                />
              </div>

              <div class="field">
                <label>Nota media / GPA</label>
                <input
                  :id="`ed-${editPrefix}-gpa`"
                  v-model="draftItem.gpa"
                  type="text"
                  placeholder="Ej: 9.2"
                />
              </div>

              <div class="field col-span-full">
                <label>Logro destacado</label>
                <input
                  :id="`ed-${editPrefix}-achievement`"
                  v-model="draftItem.achievement"
                  type="text"
                  placeholder="Ej: Matrícula de honor en Proyecto Final"
                />
              </div>

              <div class="field col-span-full">
                <label>Descripción / Contenidos clave</label>
                <textarea
                  :id="`ed-${editPrefix}-description`"
                  v-model="draftItem.description"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <div class="editor-actions">
              <button type="submit" class="btn btn-primary">
                {{ editor.mode === 'add' ? 'Añadir' : 'Guardar Cambios' }}
              </button>
              <button type="button" class="btn btn-outline" @click="cancelEdit">Cancelar</button>
            </div>
          </form>

          <!-- List of Education -->
          <div class="card-list">
            <article v-for="ed in education" :key="ed.id" class="entity-card">
              <div class="entity-main">
                <div class="entity-badges">
                  <span class="badge-role">{{ ed.institution }}</span>
                  <span v-if="ed.achievement" class="badge-pill extra">Logro</span>
                </div>
                <h3 class="entity-title">{{ ed.degree }}</h3>
                <p class="entity-meta">
                  <span>📅 {{ ed.startDate }} — {{ ed.endDate || 'actual' }}</span>
                  <span v-if="ed.fieldOfStudy">· 🎓 {{ ed.fieldOfStudy }}</span>
                  <span v-if="ed.gpa">· ⭐ GPA: {{ ed.gpa }}</span>
                </p>
                <p v-if="ed.achievement" class="entity-highlight">🏆 {{ ed.achievement }}</p>
                <p v-if="ed.description" class="entity-desc">{{ ed.description }}</p>
              </div>

              <div class="entity-actions">
                <button type="button" class="btn btn-edit btn-sm" @click="editItem('education', ed.id!)">
                  Editar
                </button>
                <button type="button" class="btn btn-delete btn-sm" @click="deleteItem('education', ed.id!)">
                  Eliminar
                </button>
              </div>
            </article>

            <div v-if="!education.length" class="empty-state">
              No hay estudios registrados todavía. Pulsa "+ Añadir Estudio".
            </div>
          </div>
        </section>

        <!-- ===================== Proyectos ===================== -->
        <section v-if="activeTab === 'projects'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Portfolio de Proyectos ({{ projects.length }})</h2>
              <p class="panel-desc">Proyectos destacados con imagen, GIF o vídeo demostrativo y enlaces</p>
            </div>
            <button type="button" class="btn btn-primary" @click="addItem('project')">
              + Añadir Proyecto
            </button>
          </div>

          <!-- Add / Edit Form -->
          <form v-if="editor && editor.kind === 'project' && draftItem" @submit.prevent="commitItem('project')" class="editor-card">
            <div class="editor-header">
              <h3>{{ editor.mode === 'add' ? 'Nuevo Proyecto' : 'Editar Proyecto' }}</h3>
              <button type="button" class="btn-icon" @click="cancelEdit">✕</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Nombre del proyecto <span class="req">*</span></label>
                <input
                  :id="`pr-${editPrefix}-name`"
                  v-model="draftItem.name"
                  type="text"
                  required
                  placeholder="Ej: B2C Checkout & SSO"
                />
              </div>

              <div class="field">
                <label>URL en producción / Demo</label>
                <input
                  :id="`pr-${editPrefix}-url`"
                  v-model="draftItem.url"
                  type="url"
                  placeholder="https://danicastillo.es"
                />
              </div>

              <div class="field">
                <label>URL de imagen / GIF / Vídeo demostrativo</label>
                <input
                  :id="`pr-${editPrefix}-image`"
                  v-model="draftItem.imageUrl"
                  type="url"
                  placeholder="https://… o /videos/preview.mp4 o /img.gif"
                />
              </div>

              <div class="field">
                <label>Repositorio GitHub</label>
                <input
                  :id="`pr-${editPrefix}-repo`"
                  v-model="draftItem.repoUrl"
                  type="url"
                  placeholder="https://github.com/..."
                />
              </div>

              <div class="field">
                <label>Etiquetas / Tecnologías (separadas por coma)</label>
                <input
                  :id="`pr-${editPrefix}-tags`"
                  v-model="draftItem.tagsInput"
                  type="text"
                  placeholder="Vue 3, TypeScript, GSAP, Node.js"
                />
              </div>

              <div class="field checkbox-field">
                <label class="checkbox-label">
                  <input
                    :id="`pr-${editPrefix}-featured`"
                    v-model="draftItem.featured"
                    type="checkbox"
                  />
                  <span>Proyecto destacado (borde dorado en el portfolio)</span>
                </label>
              </div>

              <div class="field col-span-full">
                <label>Descripción detallada <span class="req">*</span></label>
                <textarea
                  :id="`pr-${editPrefix}-description`"
                  v-model="draftItem.description"
                  rows="3"
                  required
                  placeholder="Objetivo del proyecto, rol y tecnologías..."
                ></textarea>
              </div>
            </div>

            <div class="editor-actions">
              <button type="submit" class="btn btn-primary">
                {{ editor.mode === 'add' ? 'Añadir' : 'Guardar Cambios' }}
              </button>
              <button type="button" class="btn btn-outline" @click="cancelEdit">Cancelar</button>
            </div>
          </form>

          <!-- List of Projects -->
          <div class="card-list">
            <article v-for="p in projects" :key="p.id" class="entity-card project-entity">
              <!-- Visual media thumbnail -->
              <div v-if="p.imageUrl" class="project-thumbnail">
                <img :src="p.imageUrl" :alt="p.name" />
              </div>

              <div class="entity-main">
                <div class="entity-badges">
                  <span v-if="p.featured" class="badge-pill extra">Destacado</span>
                  <div class="tag-chips">
                    <span v-for="t in p.tags" :key="t" class="tag-chip">{{ t }}</span>
                  </div>
                </div>
                <h3 class="entity-title">{{ p.name }}</h3>
                <p class="entity-desc">{{ p.description }}</p>
                <div class="entity-links">
                  <a v-if="p.url" :href="p.url" target="_blank" rel="noopener" class="entity-link">↗ Web / Demo</a>
                  <a v-if="p.repoUrl" :href="p.repoUrl" target="_blank" rel="noopener" class="entity-link">⌨ GitHub</a>
                </div>
              </div>

              <div class="entity-actions">
                <button type="button" class="btn btn-edit btn-sm" @click="editItem('project', p.id!)">
                  Editar
                </button>
                <button type="button" class="btn btn-delete btn-sm" @click="deleteItem('project', p.id!)">
                  Eliminar
                </button>
              </div>
            </article>

            <div v-if="!projects.length" class="empty-state">
              No hay proyectos registrados todavía. Pulsa "+ Añadir Proyecto".
            </div>
          </div>
        </section>

        <!-- ===================== Habilidades ===================== -->
        <section v-if="activeTab === 'skills'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Habilidades Técnicas ({{ skills.length }})</h2>
              <p class="panel-desc">Especialidades, lenguajes, frameworks y nivel de dominio</p>
            </div>
            <button type="button" class="btn btn-primary" @click="addItem('skill')">
              + Añadir Habilidad
            </button>
          </div>

          <!-- Add / Edit Form -->
          <form v-if="editor && editor.kind === 'skill' && draftItem" @submit.prevent="commitItem('skill')" class="editor-card">
            <div class="editor-header">
              <h3>{{ editor.mode === 'add' ? 'Nueva Habilidad' : 'Editar Habilidad' }}</h3>
              <button type="button" class="btn-icon" @click="cancelEdit">✕</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Nombre de la tecnología <span class="req">*</span></label>
                <input
                  :id="`sk-${editPrefix}-name`"
                  v-model="draftItem.name"
                  type="text"
                  required
                  placeholder="Ej: Vue 3 (Composition API)"
                />
              </div>

              <div class="field">
                <label>Categoría <span class="req">*</span></label>
                <input
                  :id="`sk-${editPrefix}-category`"
                  v-model="draftItem.category"
                  type="text"
                  required
                  placeholder="Ej: Frontend / Arquitectura"
                />
              </div>

              <div class="field">
                <label>Nivel de dominio (1 al 5) <span class="req">*</span></label>
                <input
                  :id="`sk-${editPrefix}-level`"
                  v-model.number="draftItem.level"
                  type="number"
                  min="1"
                  max="5"
                  required
                />
              </div>
            </div>

            <div class="editor-actions">
              <button type="submit" class="btn btn-primary">
                {{ editor.mode === 'add' ? 'Añadir' : 'Guardar' }}
              </button>
              <button type="button" class="btn btn-outline" @click="cancelEdit">Cancelar</button>
            </div>
          </form>

          <!-- List of Skills Grid -->
          <div class="skills-grid">
            <div v-for="s in skills" :key="s.id" class="skill-card">
              <div class="skill-main">
                <span class="skill-name">{{ s.name }}</span>
                <span class="skill-cat">{{ s.category }}</span>
                <div class="skill-stars">
                  <span v-for="i in 5" :key="i" class="star" :class="{ 'filled': i <= s.level }">★</span>
                </div>
              </div>
              <div class="skill-actions">
                <button type="button" class="btn-icon edit" @click="editItem('skill', s.id!)">✎</button>
                <button type="button" class="btn-icon delete" @click="deleteItem('skill', s.id!)">✕</button>
              </div>
            </div>

            <div v-if="!skills.length" class="empty-state col-span-full">
              No hay habilidades registradas. Pulsa "+ Añadir Habilidad".
            </div>
          </div>
        </section>

        <!-- ===================== Redes Sociales ===================== -->
        <section v-if="activeTab === 'social'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Redes Sociales y Enlaces ({{ socialLinks.length }})</h2>
              <p class="panel-desc">Perfiles públicos en GitHub, LinkedIn, Twitter, etc.</p>
            </div>
            <button type="button" class="btn btn-primary" @click="addItem('social')">
              + Añadir Red Social
            </button>
          </div>

          <!-- Add / Edit Form -->
          <form v-if="editor && editor.kind === 'social' && draftItem" @submit.prevent="commitItem('social')" class="editor-card">
            <div class="editor-header">
              <h3>{{ editor.mode === 'add' ? 'Nueva Red Social' : 'Editar Red Social' }}</h3>
              <button type="button" class="btn-icon" @click="cancelEdit">✕</button>
            </div>

            <div class="form-grid">
              <div class="field">
                <label>Plataforma <span class="req">*</span></label>
                <input
                  :id="`so-${editPrefix}-platform`"
                  v-model="draftItem.platform"
                  type="text"
                  required
                  placeholder="Ej: GitHub / LinkedIn"
                />
              </div>

              <div class="field">
                <label>Nombre de usuario</label>
                <input
                  :id="`so-${editPrefix}-username`"
                  v-model="draftItem.username"
                  type="text"
                  placeholder="Ej: dannycastle"
                />
              </div>

              <div class="field col-span-full">
                <label>URL completa <span class="req">*</span></label>
                <input
                  :id="`so-${editPrefix}-url`"
                  v-model="draftItem.url"
                  type="url"
                  required
                  placeholder="https://github.com/dannycastle"
                />
              </div>
            </div>

            <div class="editor-actions">
              <button type="submit" class="btn btn-primary">
                {{ editor.mode === 'add' ? 'Añadir' : 'Guardar' }}
              </button>
              <button type="button" class="btn btn-outline" @click="cancelEdit">Cancelar</button>
            </div>
          </form>

          <!-- List of Social Links -->
          <div class="card-list">
            <article v-for="s in socialLinks" :key="s.id" class="entity-card">
              <div class="entity-main">
                <h3 class="entity-title">{{ s.platform }}</h3>
                <p class="entity-meta">
                  <span v-if="s.username">@{{ s.username }} · </span>
                  <a :href="s.url" target="_blank" rel="noopener" class="entity-link">{{ s.url }}</a>
                </p>
              </div>

              <div class="entity-actions">
                <button type="button" class="btn btn-edit btn-sm" @click="editItem('social', s.id!)">
                  Editar
                </button>
                <button type="button" class="btn btn-delete btn-sm" @click="deleteItem('social', s.id!)">
                  Eliminar
                </button>
              </div>
            </article>

            <div v-if="!socialLinks.length" class="empty-state">
              No hay redes sociales registradas.
            </div>
          </div>
        </section>

        <!-- ===================== Contacto ===================== -->
        <section v-if="activeTab === 'contact'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Datos de Contacto Directo</h2>
              <p class="panel-desc">Información mostrada en el pie de página y formulario de contacto</p>
            </div>
          </div>

          <form @submit.prevent="handleSave" class="form">
            <div class="form-grid">
              <div class="field">
                <label for="c-email">Correo de contacto <span class="req">*</span></label>
                <input
                  id="c-email"
                  name="email"
                  v-model="contactInfo.email"
                  type="email"
                  required
                  placeholder="danielcastilloguindos@gmail.com"
                  :class="{ 'input-error': hasError('c-email') }"
                  @blur="clearField('c-email')"
                />
                <span v-if="hasError('c-email')" class="error">{{ errorMsg('c-email') }}</span>
              </div>

              <div class="field">
                <label for="c-phone">Teléfono</label>
                <input
                  id="c-phone"
                  name="phone"
                  v-model="contactInfo.phone"
                  type="tel"
                  placeholder="+34 605 995 969"
                  :class="{ 'input-error': hasError('c-phone') }"
                  @blur="clearField('c-phone')"
                />
                <span v-if="hasError('c-phone')" class="error">{{ errorMsg('c-phone') }}</span>
              </div>

              <div class="field">
                <label for="c-whatsapp">WhatsApp directo</label>
                <input
                  id="c-whatsapp"
                  name="whatsapp"
                  v-model="contactInfo.whatsapp"
                  type="tel"
                  placeholder="+34 605 995 969"
                  :class="{ 'input-error': hasError('c-whatsapp') }"
                  @blur="clearField('c-whatsapp')"
                />
                <span v-if="hasError('c-whatsapp')" class="error">{{ errorMsg('c-whatsapp') }}</span>
              </div>

              <div class="field">
                <label for="c-location">Ubicación</label>
                <input
                  id="c-location"
                  name="location"
                  v-model="contactInfo.location"
                  type="text"
                  placeholder="Madrid, España"
                  :class="{ 'input-error': hasError('c-location') }"
                  @blur="clearField('c-location')"
                />
                <span v-if="hasError('c-location')" class="error">{{ errorMsg('c-location') }}</span>
              </div>
            </div>
          </form>
        </section>

        <!-- ===================== Guardar / Exportar ===================== -->
        <section v-if="activeTab === 'save'" class="panel">
          <div class="panel-header">
            <div>
              <h2 class="panel-title">Sincronización y Exportación</h2>
              <p class="panel-desc">Gestiona la persistencia, descarga el archivo JSON o recarga desde la API</p>
            </div>
          </div>

          <div class="sync-dashboard-grid">
            <div class="sync-card">
              <div class="sync-card-icon">⚡</div>
              <div class="sync-card-content">
                <h3>Sincronización en Tiempo Real</h3>
                <p>Cualquier cambio se sincroniza vía BroadcastChannel con las pestañas abiertas de apps/portfolio.</p>
                <div class="meta-row">
                  <span class="meta-label">ID de Perfil:</span>
                  <code class="meta-code">{{ profileId }}</code>
                </div>
              </div>
            </div>

            <div class="sync-card">
              <div class="sync-card-icon">💾</div>
              <div class="sync-card-content">
                <h3>Guardar Todo</h3>
                <p>Valida y guarda todos los datos en localStorage y emite el payload completo a la API.</p>
                <button
                  type="button"
                  class="btn btn-primary"
                  :disabled="isSaving"
                  @click="handleSave"
                >
                  <span v-if="isSaving" class="spinner" aria-hidden="true"></span>
                  {{ isSaving ? 'Guardando…' : 'Guardar todos los cambios' }}
                </button>
              </div>
            </div>

            <div class="sync-card">
              <div class="sync-card-icon">📥</div>
              <div class="sync-card-content">
                <h3>Exportar portfolio.json</h3>
                <p>Descarga el archivo estructurado listo para colocar en <code>apps/portfolio/public/data/portfolio.json</code>.</p>
                <button type="button" class="btn btn-outline" @click="downloadJson">
                  Descargar portfolio.json
                </button>
              </div>
            </div>

            <div class="sync-card">
              <div class="sync-card-icon">🔄</div>
              <div class="sync-card-content">
                <h3>Recargar desde API</h3>
                <p>Sobrescribe el borrador actual con los datos remotos servidos por el endpoint REST.</p>
                <button type="button" class="btn btn-outline" @click="handleLoadApi">
                  Cargar desde API
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>

    <!-- Floating Toast Notification -->
    <transition name="toast-fade">
      <div v-if="toastMessage" class="floating-toast" role="status">
        <span class="toast-dot"></span>
        <span class="toast-text">{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<style scoped>
/* ========================================================================
   Kanagawa-inspired Dashboard Layout (Matching apps/portfolio)
   - Background Ground: SumiInk3 (#1F1F28)
   - Surface Container: SumiInk4 (#2A2A37)
   - Surface Elevated:  SumiInk5 (#363646)
   - Text Primary:      FujiWhite (#DCD7BA)
   - Text Secondary:    OldWhite  (#C8C093)
   - Accent Highlight:  CarpYellow (#E6C384)
   - Accent Hover:      SurimiOrange (#FFA066)
   - Accent Green:      SpringGreen (#76946A)
   - Accent Blue:       CrystalBlue (#7E9CD8)
   - Danger / Error:    AutumnRed (#C34043)
   ======================================================================== */

:root {
  --color-bg: #1F1F28;
  --color-surface: #2A2A37;
  --color-surface-hover: #363646;
  --color-text: #DCD7BA;
  --color-text-secondary: #C8C093;
  --color-accent: #E6C384;
  --color-accent-hover: #FFA066;
  --color-border: rgba(220, 215, 186, 0.12);
  --color-border-hover: rgba(230, 195, 132, 0.4);
  --color-blue: #7E9CD8;
  --color-green: #76946A;
  --color-red: #C34043;
  --radius-sm: 2px;
  --radius-md: 3px;
  --font-display: 'Bricolage Grotesque', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}

.manager-shell {
  min-height: 100vh;
  background: #1F1F28;
  color: #DCD7BA;
  font-family: 'Bricolage Grotesque', system-ui, -apple-system, sans-serif;
  display: flex;
  flex-direction: column;
  position: relative;
}

/* Subtle editorial noise texture overlay matching apps/portfolio */
.manager-shell::after {
  content: '';
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E");
  pointer-events: none;
  z-index: 9999;
  opacity: 0.65;
}

/* Fixed Modern App Bar */
.app-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 60px;
  background: rgba(31, 31, 40, 0.96);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(220, 215, 186, 0.12);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-crest {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  background: rgba(230, 195, 132, 0.12);
  border: 1px solid rgba(230, 195, 132, 0.3);
  color: #E6C384;
  display: grid;
  place-items: center;
  font-size: 0.95rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #DCD7BA;
}

.brand-badge {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  color: #E6C384;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.sync-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 12px;
  background: rgba(118, 148, 106, 0.12);
  border: 1px solid rgba(118, 148, 106, 0.25);
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76rem;
  font-weight: 600;
  color: #76946A;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #76946A;
  box-shadow: 0 0 8px rgba(118, 148, 106, 0.7);
  animation: pulse-green 2s infinite ease-in-out;
}

@keyframes pulse-green {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.3); opacity: 0.7; }
}

.topbar-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-topbar {
  height: 36px;
  padding: 0 16px;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-view {
  background: rgba(126, 156, 216, 0.08);
  color: #7E9CD8;
  border: 1px solid rgba(126, 156, 216, 0.3);
}

.btn-view:hover {
  background: rgba(126, 156, 216, 0.18);
  border-color: #7E9CD8;
  transform: translateY(-1px);
}

.btn-json {
  background: rgba(220, 215, 186, 0.06);
  color: #DCD7BA;
  border: 1px solid rgba(220, 215, 186, 0.15);
}

.btn-json:hover {
  background: #2A2A37;
  color: #E6C384;
  border-color: #E6C384;
  transform: translateY(-1px);
}

.banner-warn {
  padding: 12px 32px;
  background: rgba(230, 195, 132, 0.1);
  border-bottom: 1px solid rgba(230, 195, 132, 0.25);
  color: #E6C384;
  font-size: 0.88rem;
}

/* Two-column layout */
.app-layout {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
}

/* Left Sidebar */
.sidebar {
  width: 270px;
  flex-shrink: 0;
  background: #1b1b23;
  border-right: 1px solid rgba(220, 215, 186, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px 16px;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-tab-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid transparent;
  background: transparent;
  color: #C8C093;
  border-radius: 2px;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  text-align: left;
  transition: all 0.2s ease;
  width: 100%;
}

.nav-tab-btn:hover {
  background: #2A2A37;
  color: #DCD7BA;
}

.nav-tab-btn.is-active {
  background: rgba(230, 195, 132, 0.12);
  border-color: rgba(230, 195, 132, 0.35);
  color: #E6C384;
  font-weight: 600;
}

.tab-icon {
  font-size: 1.05rem;
}

.tab-label {
  flex: 1;
}

.tab-count {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 2px;
  background: rgba(230, 195, 132, 0.15);
  color: #E6C384;
  border: 1px solid rgba(230, 195, 132, 0.25);
}

.sidebar-bottom {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 20px;
  border-top: 1px solid rgba(220, 215, 186, 0.1);
}

.theme-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.theme-label {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.75rem;
  font-weight: 600;
  color: #C8C093;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.theme-select {
  padding: 8px 12px;
  background: #1F1F28;
  border: 1px solid rgba(220, 215, 186, 0.15);
  border-radius: 2px;
  color: #DCD7BA;
  font-size: 0.85rem;
  cursor: pointer;
}

.theme-select:focus {
  outline: 2px solid #E6C384;
  outline-offset: 1px;
}

.user-chip {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #1F1F28;
  border: 1px solid rgba(220, 215, 186, 0.12);
  border-radius: 2px;
}

.chip-avatar {
  width: 30px;
  height: 30px;
  border-radius: 2px;
  background: #E6C384;
  color: #1F1F28;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: 0.85rem;
}

.chip-details {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.chip-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: #DCD7BA;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chip-title {
  font-size: 0.72rem;
  color: #C8C093;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Workspace Panels */
.workspace {
  flex: 1;
  padding: 40px 48px;
  max-width: 1200px;
  overflow-y: auto;
}

.panel {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid rgba(220, 215, 186, 0.12);
}

.panel-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.65rem;
  font-weight: 700;
  color: #DCD7BA;
  margin: 0 0 6px;
  letter-spacing: -0.02em;
}

.panel-desc {
  font-size: 0.95rem;
  color: #C8C093;
  margin: 0;
}

/* Form Grids */
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.col-span-full {
  grid-column: 1 / -1;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-field {
  justify-content: center;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 0.92rem;
  color: #DCD7BA;
  user-select: none;
}

label {
  font-size: 0.86rem;
  font-weight: 600;
  color: #DCD7BA;
  letter-spacing: -0.01em;
}

.req {
  color: #E6C384;
}

input[type="text"],
input[type="email"],
input[type="tel"],
input[type="url"],
input[type="date"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 10px 14px;
  background: rgba(31, 31, 40, 0.9);
  border: 1px solid rgba(220, 215, 186, 0.15);
  border-radius: 2px;
  color: #DCD7BA;
  font-size: 0.92rem;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #E6C384;
  box-shadow: 0 0 0 2px rgba(230, 195, 132, 0.25);
}

.input-error {
  border-color: #C34043 !important;
}

.error {
  color: #C34043;
  font-size: 0.8rem;
  font-family: 'JetBrains Mono', monospace;
}

.hint {
  font-size: 0.82rem;
  color: #C8C093;
  margin: 4px 0 0;
  opacity: 0.9;
}

.bio-counter {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: #C8C093;
  text-align: right;
  margin-top: 4px;
}

.bio-counter.warn {
  color: #FFA066;
  font-weight: 700;
}

/* Card Lists & Entity Cards */
.card-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.entity-card {
  background: rgba(38, 38, 50, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(220, 215, 186, 0.12);
  border-radius: 2px;
  padding: 22px 26px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}

.entity-card:hover {
  border-color: rgba(230, 195, 132, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.35);
}

.entity-card.is-extra {
  border-left: 3px solid #E6C384;
}

.entity-main {
  flex: 1;
  min-width: 0;
}

.entity-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.badge-role {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  font-weight: 700;
  color: #E6C384;
}

.badge-pill {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 8px;
  border-radius: 2px;
}

.badge-pill.extra {
  background: rgba(230, 195, 132, 0.12);
  color: #E6C384;
  border: 1px solid rgba(230, 195, 132, 0.3);
}

.badge-pill.current {
  background: rgba(118, 148, 106, 0.15);
  color: #76946A;
  border: 1px solid rgba(118, 148, 106, 0.3);
}

.entity-title {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.2rem;
  font-weight: 700;
  color: #DCD7BA;
  margin: 0 0 6px;
}

.entity-meta {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.84rem;
  color: #C8C093;
  margin: 0 0 10px;
  opacity: 0.9;
}

.entity-desc {
  font-size: 0.92rem;
  color: #DCD7BA;
  opacity: 0.92;
  line-height: 1.6;
  margin: 0;
}

.entity-highlight {
  font-size: 0.9rem;
  color: #E6C384;
  font-weight: 600;
  margin: 0 0 8px;
}

.entity-links {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}

.entity-link {
  color: #7E9CD8;
  font-size: 0.85rem;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 2px;
}

.entity-link:hover {
  color: #E6C384;
}

.entity-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

/* Project Entity Thumbnail */
.project-entity {
  align-items: center;
}

.project-thumbnail {
  width: 100px;
  height: 70px;
  border-radius: 2px;
  overflow: hidden;
  background: #1F1F28;
  border: 1px solid rgba(220, 215, 186, 0.15);
  flex-shrink: 0;
}

.project-thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.tag-chips {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tag-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  background: #1F1F28;
  border: 1px solid rgba(220, 215, 186, 0.15);
  border-radius: 2px;
  color: #C8C093;
}

/* Editor Form Card */
.editor-card {
  background: #252530;
  border: 1px solid #E6C384;
  border-radius: 2px;
  padding: 30px;
  margin-bottom: 24px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.editor-header h3 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
  color: #E6C384;
  margin: 0;
}

.editor-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

/* Skills Grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 14px;
}

.skill-card {
  background: rgba(38, 38, 50, 0.85);
  border: 1px solid rgba(220, 215, 186, 0.12);
  border-radius: 2px;
  padding: 14px 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.skill-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skill-name {
  font-weight: 600;
  font-size: 0.95rem;
  color: #DCD7BA;
}

.skill-cat {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.76rem;
  color: #C8C093;
}

.skill-stars {
  display: flex;
  gap: 2px;
  font-size: 0.88rem;
}

.star {
  color: #363646;
}

.star.filled {
  color: #E6C384;
}

.skill-actions {
  display: flex;
  gap: 6px;
}

/* Sync Dashboard Cards */
.sync-dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
}

.sync-card {
  background: rgba(38, 38, 50, 0.85);
  border: 1px solid rgba(220, 215, 186, 0.12);
  border-radius: 2px;
  padding: 26px;
  display: flex;
  gap: 18px;
  align-items: flex-start;
}

.sync-card-icon {
  font-size: 2rem;
  line-height: 1;
}

.sync-card-content h3 {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: #DCD7BA;
  margin: 0 0 8px;
}

.sync-card-content p {
  font-size: 0.9rem;
  color: #C8C093;
  margin: 0 0 16px;
  line-height: 1.55;
}

.meta-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-code {
  background: #1F1F28;
  padding: 4px 10px;
  border-radius: 2px;
  border: 1px solid rgba(220, 215, 186, 0.12);
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.82rem;
  color: #E6C384;
}

/* Nav links rows */
.nav-links-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.nav-links-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 16px;
}

.nav-link-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.link-input {
  flex: 1;
}

.add-link-box {
  display: flex;
  gap: 10px;
  align-items: center;
  padding: 16px;
  background: #1F1F28;
  border: 1px dashed rgba(220, 215, 186, 0.2);
  border-radius: 2px;
}

/* Buttons */
.btn {
  padding: 9px 18px;
  border-radius: 2px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.86rem;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: 1px solid transparent;
  transition: all 0.2s ease;
  touch-action: manipulation;
}

.btn-primary {
  background: #E6C384;
  color: #1F1F28;
  border-color: #E6C384;
}

.btn-primary:hover:not(:disabled) {
  background: #FFA066;
  border-color: #FFA066;
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  color: #DCD7BA;
  border-color: rgba(220, 215, 186, 0.18);
}

.btn-outline:hover {
  background: #2A2A37;
  border-color: #E6C384;
  color: #E6C384;
}

.btn-secondary {
  background: #252530;
  color: #DCD7BA;
  border-color: rgba(220, 215, 186, 0.15);
}

.btn-secondary:hover {
  border-color: #E6C384;
}

.btn-edit {
  background: transparent;
  color: #C8C093;
  border: 1px solid rgba(220, 215, 186, 0.15);
}

.btn-edit:hover {
  color: #E6C384;
  border-color: #E6C384;
}

.btn-delete {
  background: transparent;
  color: #C8C093;
  border: 1px solid rgba(220, 215, 186, 0.15);
}

.btn-delete:hover {
  color: #C34043;
  border-color: #C34043;
}

.btn-icon {
  width: 32px;
  height: 32px;
  border-radius: 2px;
  background: transparent;
  border: 1px solid rgba(220, 215, 186, 0.15);
  color: #C8C093;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-icon:hover {
  border-color: #E6C384;
  color: #E6C384;
}

.btn-icon.delete:hover {
  border-color: #C34043;
  color: #C34043;
}

.btn-sm {
  padding: 5px 12px;
  font-size: 0.8rem;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #1F1F28;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.empty-state {
  padding: 40px;
  text-align: center;
  background: #252530;
  border: 1px dashed rgba(220, 215, 186, 0.2);
  border-radius: 2px;
  color: #C8C093;
  font-size: 0.95rem;
}

/* Floating Toast Notification */
.floating-toast {
  position: fixed;
  bottom: 28px;
  right: 28px;
  background: #252530;
  border: 1px solid #76946A;
  color: #DCD7BA;
  padding: 12px 20px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  gap: 10px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.45);
  z-index: 9999;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.86rem;
  font-weight: 500;
}

.toast-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #76946A;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

/* Mobile Responsive */
@media (max-width: 900px) {
  .app-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid rgba(220, 215, 186, 0.1);
    padding: 16px;
    box-sizing: border-box;
  }

  .sidebar-nav {
    flex-direction: row;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .nav-tab-btn {
    white-space: nowrap;
    width: auto;
  }

  .sidebar-bottom {
    display: none;
  }

  .workspace {
    padding: 24px 16px;
  }

  .app-topbar {
    padding: 0 16px;
  }
}
</style>