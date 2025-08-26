// src/lib/stores/user.ts
import { writable } from "svelte/store";

export type User = {
  id: number;
  code?: string | null;
  name: string;
  email?: string | null;
  photo: string;
  role: "admin" | "user";
  queueId?: number | null;
  createdAt: string;
  updatedAt: string;
};

export const user = writable<User | null>(null);

/**
 * Adapter untuk mapping user dari API/Prisma ke store
 */
export function mapUserFromApi(apiUser: unknown): User {
  const u = apiUser as {
    id: number;
    code?: string | null;
    name: string;
    email?: string | null;
    photo?: string | null;
    role: string;
    queueId?: number | null;
    createdAt: string | Date;
    updatedAt: string | Date;
  };

  return {
    id: u.id,
    code: u.code ?? null,
    name: u.name,
    email: u.email ?? null,
    photo: u.photo ?? "/uploads/placeholder.png",
    role: u.role as "admin" | "user",
    queueId: u.queueId ?? null,
    createdAt: new Date(u.createdAt).toISOString(),
    updatedAt: new Date(u.updatedAt).toISOString(),
  };
}
