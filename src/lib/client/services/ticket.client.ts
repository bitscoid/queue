// src/lib/client/services/ticket.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { ticketSchema } from "$lib/validations/ticket";
import type { TicketInput } from "$lib/validations/ticket";
import type { Ticket } from "../stores/ticket.store";

// Ambil semua tiket
export async function getTickets(): Promise<Ticket[]> {
    return fetcher<Ticket[]>("/api/tickets");
}

// Buat tiket baru
export async function createTicket(queueId: number): Promise<Ticket> {
    const payload: TicketInput = {
        queueId,
        seqNumber: 1, // default seqNumber sementara, server akan override
        status: "PENDING"
    };

    return fetcher<Ticket>("/api/tickets", {
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" }
    }, ticketSchema);
}

// Update tiket
export async function updateTicket(id: number, data: Partial<Ticket>): Promise<Ticket> {
    // jika ingin validasi sebagian field, bisa buat zod partial schema
    return fetcher<Ticket>(`/api/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }, ticketSchema);
}
