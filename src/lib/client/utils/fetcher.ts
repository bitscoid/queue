// utils/fetcher.ts
import type { z } from "zod";

export class FetcherError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export async function fetcher<T>(
  url: string,
  options: RequestInit = {},
  validator?: z.ZodSchema<T>,
): Promise<T> {
  const headers: HeadersInit = {
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...options.headers,
  };

  const res = await fetch(url, { ...options, headers });
  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new FetcherError(
      json.message || "Terjadi kesalahan saat memuat data",
      res.status,
      json,
    );
  }

  if (validator) {
    const parsed = validator.safeParse(json);
    if (!parsed.success) {
      throw new FetcherError(
        "Data response tidak valid",
        res.status,
        parsed.error.flatten(),
      );
    }
    return parsed.data;
  }

  // fallback tanpa validasi
  return json as T;
}
