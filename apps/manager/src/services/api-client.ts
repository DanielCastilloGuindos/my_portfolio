// apps/manager/src/services/api-client.ts
import type { PortfolioData } from '@portfolio/core';

const API_BASE = 'http://localhost:4323';

async function okOrThrow(res: Response): Promise<void> {
  if (res.ok) return;
  let message = `Request failed (${res.status})`;
  try {
    const body = await res.json();
    message = typeof body?.error === 'string' ? body.error : message;
  } catch {
    // Ignore non-JSON error bodies; keep the status-based message.
  }
  throw new Error(message);
}

export async function savePortfolio(data: PortfolioData): Promise<void> {
  const res = await fetch(`${API_BASE}/api/admin/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  await okOrThrow(res);
}

export async function loadPortfolio(profileId: string): Promise<PortfolioData> {
  const res = await fetch(`${API_BASE}/api/portfolio/${encodeURIComponent(profileId)}`);
  await okOrThrow(res);
  return (await res.json()) as PortfolioData;
}
