// src/lib/client/services/ticket.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { ticketSchema } from "$lib/validations/ticket";
import type { Ticket } from "../stores/ticket.store";

// Ambil semua tiket
export async function getTickets(): Promise<Ticket[]> {
    return fetcher<Ticket[]>("/api/tickets");
}

// Buat tiket baru
export async function createTicket(queueId: number): Promise<Ticket> {
    if (!queueId || queueId <= 0) {
        throw new Error("Queue harus dipilih");
    }

    // Hanya kirim queueId, server akan generate seqNumber
    return fetcher<Ticket>(
        "/api/tickets",
        {
            method: "POST",
            body: JSON.stringify({ queueId }),
            headers: { "Content-Type": "application/json" }
        },
        ticketSchema
    );
}

// Update tiket
export async function updateTicket(id: number, data: Partial<Omit<Ticket, "id" | "seqNumber">>): Promise<Ticket> {
    // seqNumber jangan dikirim saat update, server yang handle
    return fetcher<Ticket>(`/api/tickets/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
    }, ticketSchema);
}
