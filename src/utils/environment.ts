/**
 * Environment detection and network utilities for standalone static (GitHub Pages)
 * vs full-stack development modes.
 */

export function isStaticDeployment(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return (
    host.includes('github.io') ||
    window.location.protocol === 'file:' ||
    host.includes('pages.dev') ||
    host.includes('vercel.app') ||
    host.includes('netlify.app') ||
    // Static hosting with no port specified (excluding local and dev cloud environments)
    (!host.includes('localhost') &&
      !host.includes('127.0.0.1') &&
      !host.includes('run.app') &&
      !host.includes('0.0.0.0'))
  );
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
