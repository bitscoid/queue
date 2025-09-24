// src/lib/client/services/queue.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { queueSchema, queueUpdateSchema } from "$lib/validations/queue";
import { z } from "zod";

// Schema output server
export const queueResponseSchema = z.object({
  id: z.number(),
  code: z.string(),
  name: z.string(),
  ticketPrefix: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type QueueOutput = z.infer<typeof queueResponseSchema>;

// Ambil semua queue
export async function getQueues(): Promise<QueueOutput[]> {
  const allQueues = await fetcher<QueueOutput[]>("/api/queues");
  // Filter hanya layanan DESAINER
  return allQueues.filter((queue) => queue.code === "DESAINER");
}

// Buat queue baru
export async function createQueue(
  data: z.infer<typeof queueSchema>,
): Promise<QueueOutput> {
  const payload = queueSchema.parse(data); // validasi input
  return fetcher<QueueOutput>(
    "/api/queues",
    {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    },
    queueResponseSchema,
  ); // validasi output
}

// Update queue
export async function updateQueue(
  id: number,
  data: z.infer<typeof queueUpdateSchema>,
): Promise<QueueOutput> {
  const payload = queueUpdateSchema.parse(data); // validasi input
  return fetcher<QueueOutput>(
    `/api/queues/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    },
    queueResponseSchema,
  ); // validasi output
}

// Hapus queue
export async function deleteQueue(id: number): Promise<boolean> {
  return fetcher<boolean>(`/api/queues/${id}`, { method: "DELETE" });
}
