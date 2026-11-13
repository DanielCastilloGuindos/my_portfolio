// apps/manager/src/services/storage.ts
// Optional local fallback so the user doesn't lose work when the API is not running.
import type { PortfolioData } from '@portfolio/core';

const DRAFT_KEY = 'portfolio-manager-draft';
const PROFILE_ID_KEY = 'portfolio-manager-profile-id';

export function saveDraft(data: PortfolioData): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
  } catch {
    // localStorage may be unavailable or quota-exceeded; silently ignore.
  }
}

export function loadDraft(): PortfolioData | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PortfolioData) : null;
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    // Ignore.
  }
}

export function getProfileId(): string {
  let id = localStorage.getItem(PROFILE_ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    try {
      localStorage.setItem(PROFILE_ID_KEY, id);
    } catch {
      // Ignore.
    }
  }
  return id;
}
