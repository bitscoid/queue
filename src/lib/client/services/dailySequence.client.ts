// src/lib/client/services/dailySequence.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import type { DailySequence } from "../stores/dailySequence.store";

export async function getSequences(queueId: number): Promise<DailySequence[]> {
    return fetcher<DailySequence[]>(`/api/queues/${queueId}/sequences`);
}
