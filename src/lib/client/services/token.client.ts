// src/lib/client/services/token.service.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { tokenSchema, tokenUpdateSchema } from "$lib/validations/token";
import type { TokenFormSchema, TokenUpdateSchema } from "$lib/validations/token";

// Create token
export async function createKey(data: TokenFormSchema): Promise<TokenFormSchema> {
  return fetcher<TokenFormSchema>("/api/token", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  }, tokenSchema);
}

// Update token
export async function updateKey(id: number, data: TokenUpdateSchema): Promise<TokenUpdateSchema> {
  return fetcher<TokenUpdateSchema>(`/api/token/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  }, tokenUpdateSchema);
}

// Delete token
export async function deleteKey(id: number): Promise<boolean> {
  try {
    await fetcher<null>(`/api/token/${id}`, { method: "DELETE" });
    return true;
  } catch {
    return false;
  }
}

// Get token by ID
export async function getKey(id: number): Promise<TokenFormSchema> {
  return fetcher<TokenFormSchema>(`/api/token/${id}`, {}, tokenSchema);
}
