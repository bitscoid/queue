// src/lib/client/services/ticket.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { ticketDisplaySchema } from "$lib/validations/ticket";
import type { TicketDisplay } from "$lib/types";

// Ambil semua tiket
export async function getTickets(): Promise<TicketDisplay[]> {
  return fetcher<TicketDisplay[]>("/api/tickets");
}

// Buat tiket baru
export async function createTicket(queueId: number): Promise<TicketDisplay> {
  if (!queueId || queueId <= 0) {
    throw new Error("Queue harus dipilih");
  }

  // Hanya kirim queueId, server akan generate seqNumber
  return fetcher<TicketDisplay>(
    "/api/tickets",
    {
      method: "POST",
      body: JSON.stringify({ queueId }),
      headers: { "Content-Type": "application/json" },
    },
    ticketDisplaySchema,
  );
}

// Update tiket
export async function updateTicket(
  id: number,
  data: Partial<Omit<TicketDisplay, "id" | "seqNumber">>,
): Promise<TicketDisplay> {
  // seqNumber jangan dikirim saat update, server yang handle
  return fetcher<TicketDisplay>(
    `/api/tickets/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    },
    ticketDisplaySchema,
  );
}
