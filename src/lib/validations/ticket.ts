// src/lib/validations/ticket.ts
import { z } from "zod";

export const ticketSchema = z.object({
    queueId: z
        .number()
        .min(1, { message: "Queue harus dipilih" }), // pakai message
    seqNumber: z
        .number()
        .min(1, { message: "Nomor urut harus lebih dari 0" }),
    status: z.enum([
        "PENDING",
        "CALLED",
        "SERVING",
        "SKIPPED",
        "COMPLETED",
        "CANCELLED"
    ], { message: "Status tidak valid" }),
});

export type TicketInput = z.infer<typeof ticketSchema>;
