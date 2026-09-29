/**
 * Environment detection and network utilities for standalone client-side execution
 * (GitHub Pages, AI Studio preview, Vercel, offline) vs dedicated backend API modes.
 */

export function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return true;
  // If a dedicated backend URL is explicitly configured, use network API mode
  if (import.meta.env.VITE_API_URL) return false;
  // Default to standalone client-side calculation engine
  return true;
}

export async function safeFetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 1800
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timer);
  }
}
