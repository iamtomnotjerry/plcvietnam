'use client';

import { useCallback, useState } from 'react';
import { extractApiErrorMessage } from '@/features/auth/api-error';

interface SubmitOptions<TBody> {
  url: string;
  body: TBody;
  defaultErrorMessage: string;
}

type SubmitResult<TData> = { ok: true; data: TData } | { ok: false; data: unknown };

/**
 * Hook chia sẻ logic submit cho các auth form (sign-in / sign-up / forgot / reset):
 * tự quản loading + error, parse JSON response một cách phòng thủ, và trích xuất
 * message lỗi qua `extractApiErrorMessage`. Trả về kết quả để form quyết định bước success.
 */
export function useAuthSubmit() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = useCallback(
    async <TBody, TData = unknown>(opts: SubmitOptions<TBody>): Promise<SubmitResult<TData>> => {
      setError(null);
      setLoading(true);
      try {
        const response = await fetch(opts.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(opts.body),
        });
        const data = (await response.json().catch(() => ({}))) as unknown;
        if (!response.ok) {
          setError(extractApiErrorMessage(data, opts.defaultErrorMessage));
          return { ok: false, data };
        }
        return { ok: true, data: data as TData };
      } catch {
        setError(opts.defaultErrorMessage);
        return { ok: false, data: null };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { submit, error, loading, setError };
}
