import { env } from "../../config/env.js";

/**
 * Browser-loadable URL for a stored object key.
 * - R2: use OBJECT_STORAGE_PUBLIC_BASE_URL + key (custom domain / r2.dev public URL)
 * - Local: returns null so callers can prefix with API base (e.g. VITE_API_BASE_URL)
 */
export function publicUrlForStorageKey(storageKey) {
  if (!storageKey) return null;
  if (/^https?:\/\//i.test(storageKey)) return storageKey;
  const base = env.OBJECT_STORAGE_PUBLIC_BASE_URL?.replace(/\/$/, "");
  if (base) return `${base}/${storageKey}`;
  return null;
}
