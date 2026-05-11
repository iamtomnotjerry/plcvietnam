import { messageFromAdminApiErrorBody } from '@/lib/admin/parse-admin-api-error';

const BASE: RequestInit = {
  credentials: 'same-origin',
};

/**
 * Same-origin admin API request with session cookies. Prefer this over raw `fetch` for `/api/admin/*`.
 */
export function adminFetch(input: string | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input.href;
  return fetch(url, { ...BASE, ...init });
}

/**
 * Parses JSON on success; throws `Error` with a message from {@link messageFromAdminApiErrorBody} on HTTP errors.
 * Empty success bodies resolve to `undefined` as `T`.
 */
export async function adminFetchJson<T = unknown>(
  input: string | URL,
  init?: RequestInit
): Promise<T> {
  const res = await adminFetch(input, init);
  const text = await res.text();
  let parsed: unknown;
  if (!text.trim()) {
    parsed = undefined;
  } else {
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      parsed = text;
    }
  }
  if (!res.ok) {
    const msg =
      messageFromAdminApiErrorBody(parsed) ??
      (typeof parsed === 'string' && parsed.trim() ? parsed.trim() : null) ??
      `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return parsed as T;
}

/**
 * POST multipart (`FormData`) to an admin route that returns JSON (e.g. `POST /api/admin/upload`).
 * Do not set `Content-Type` — the browser sets the boundary.
 */
export async function adminFetchFormDataJson<T = unknown>(
  url: string,
  formData: FormData
): Promise<T> {
  return adminFetchJson<T>(url, { method: 'POST', body: formData });
}
