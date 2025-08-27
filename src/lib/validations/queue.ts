// src/lib/validations/queue.ts
import { z } from "zod";

// Schema untuk tambah queue
export const queueSchema = z.object({
    code: z
        .string()
        .min(2, "Kode queue minimal 2 karakter")
        .max(20, "Kode queue maksimal 20 karakter")
        .regex(/^[A-Z0-9_-]+$/, "Kode hanya boleh huruf besar, angka, _ atau -"),
    name: z.string().min(2, "Nama queue minimal 2 karakter"),
    ticketPrefix: z
        .string()
        .min(1, "Ticket prefix minimal 1 karakter")
        .max(5, "Ticket prefix maksimal 5 karakter")
        .regex(/^[A-Z]+$/, "Ticket prefix harus huruf besar"),
});

// Schema untuk update queue (opsional, sama seperti tambah tapi bisa diubah sesuai kebutuhan)
export const queueUpdateSchema = queueSchema.partial();
