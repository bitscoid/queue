// src/lib/validations/ticket.ts
import { z } from "zod";

// Input untuk create/update tiket
export const ticketInputSchema = z.object({
    queueId: z.number().min(1, "Queue harus dipilih"),
    seqNumber: z.number().min(1, "Nomor urut harus lebih dari 0"),
    status: z.enum([
        "PENDING",
        "CALLED",
        "SERVING",
        "SKIPPED",
        "COMPLETED",
        "CANCELLED"
    ], "Status tidak valid"),
});

// Output dari server
export const ticketSchema = z.object({
    id: z.number(),
    fullNumber: z.string(),
    queueId: z.number(),
    seqNumber: z.number(),
    status: z.enum([
        "PENDING",
        "CALLED",
        "SERVING",
        "SKIPPED",
        "COMPLETED",
        "CANCELLED"
    ]),
    date: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type TicketInput = z.infer<typeof ticketInputSchema>;
export type Ticket = z.infer<typeof ticketSchema>;
