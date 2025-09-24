// src/lib/client/stores/dailySequence.store.ts
import { writable } from "svelte/store";

export type DailySequence = {
  id: number;
  queueId: number;
  date: string; // ISO string
  nextSeq: number;
  updatedAt: string;
};

export const dailySequences = writable<DailySequence[]>([]);
