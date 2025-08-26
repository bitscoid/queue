// src/lib/client/services/queue.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import type { Queue } from "../stores/queue.store";

export async function getQueues(): Promise<Queue[]> {
    return fetcher<Queue[]>("/api/queues");
}

export async function createQueue(data: Partial<Queue>): Promise<Queue> {
    return fetcher<Queue>("/api/queues", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
