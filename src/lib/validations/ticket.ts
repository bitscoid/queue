// src/lib/validations/ticket.ts
import { z } from "zod";

// Input untuk create/update tiket
export const ticketInputSchema = z.object({
  queueId: z.number().min(1, "Queue harus dipilih"),
  status: z.enum(
    ["PENDING", "CALLED", "SERVING", "SKIPPED", "COMPLETED", "CANCELLED"],
    "Status tidak valid",
  ),
  // seqNumber tidak wajib di frontend, server akan generate
});

export const ticketDisplaySchema = z.object({
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
    "CANCELLED",
  ]),
  date: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  queueName: z.string().optional().default(""),
  servedByName: z.string().optional().default(""),
});

export type TicketInput = z.infer<typeof ticketInputSchema>;
export type TicketDisplay = z.infer<typeof ticketDisplaySchema>;

// For internal use (with Date objects)
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
    "CANCELLED",
  ]),
  date: z.string(), // API returns strings, we convert to Date as needed
  createdAt: z.string(),
  updatedAt: z.string(),
});
