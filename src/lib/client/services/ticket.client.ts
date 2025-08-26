// src/lib/client/services/ticket.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import type { Ticket } from "../stores/ticket.store";

export async function getTickets(): Promise<Ticket[]> {
    return fetcher<Ticket[]>("/api/tickets");
}

export async function createTicket(queueId: number): Promise<Ticket> {
    return fetcher<Ticket>("/api/tickets", {
        method: "POST",
        body: JSON.stringify({ queueId }),
    });
}

export async function updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    return fetcher<Ticket>(`/api/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}
