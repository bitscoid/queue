import { writable } from "svelte/store";
import type { Ticket as TicketType } from "$lib/types";

export const tickets = writable<TicketType[]>([]);
export const currentTicket = writable<TicketType | null>(null);
