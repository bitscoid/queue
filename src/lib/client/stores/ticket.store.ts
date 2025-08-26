// src/lib/client/stores/ticket.store.ts
import { writable } from "svelte/store";

export type Ticket = {
    id: number;
    queueId: number;
    seqNumber: number;
    fullNumber: string;
    status: "PENDING" | "CALLED" | "SERVING" | "SKIPPED" | "COMPLETED" | "CANCELLED";
    date: string; // ISO string
    servedByUserId?: number | null;
    createdAt: string;
    updatedAt: string;
};

export const tickets = writable<Ticket[]>([]);
export const currentTicket = writable<Ticket | null>(null);
