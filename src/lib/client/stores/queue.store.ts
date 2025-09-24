// src/lib/client/stores/queue.store.ts
import { writable } from "svelte/store";

export type Queue = {
  id: number;
  code: string;
  name: string;
  ticketPrefix: string;
  createdAt: string;
  updatedAt: string;
};

export const queues = writable<Queue[]>([]);
export const currentQueue = writable<Queue | null>(null);
