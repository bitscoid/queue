// lib/client/utils/date.ts

/**
 * Helper untuk parsing date string jadi Date.
 * Return null kalau invalid.
 */
function parseDate(dateStr: string): Date | null {
  const date = new Date(dateStr);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Helper format date dengan opsi tertentu.
 */
function formatWithOptions(dateStr: string, options: Intl.DateTimeFormatOptions): string {
  const date = parseDate(dateStr);
  if (!date) return "-"; // fallback kalau invalid
  return date.toLocaleString("id-ID", options);
}

/**
 * Format hanya tanggal (contoh: 26 Agt 2025)
 */
export function formatDate(dateStr: string): string {
  return formatWithOptions(dateStr, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Format tanggal + jam (contoh: 26 Agt 2025 14.35)
 */
export function formatDateTime(dateStr: string): string {
  return formatWithOptions(dateStr, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format hanya jam:menit (contoh: 14.35)
 */
export function formatTime(dateStr: string): string {
  return formatWithOptions(dateStr, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Konversi Date ke ISO string dengan timezone lokal.
 * Contoh: 2025-08-26T14:35:00
 */
export function toISOStringLocal(date: Date): string {
  const tzoffset = date.getTimezoneOffset() * 60000; // offset dalam ms
  return new Date(date.getTime() - tzoffset).toISOString().slice(0, -1);
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}