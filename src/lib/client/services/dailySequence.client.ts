// src/lib/client/services/dailySequence.client.ts
import { fetcher } from "$lib/client/utils/fetcher";
import { dailySequenceArraySchema } from "$lib/validations/dailySequence";
import type { DailySequence } from "$lib/validations/dailySequence";

export async function getSequences(queueId: number): Promise<DailySequence[]> {
  return fetcher<DailySequence[]>(
    `/api/queues/${queueId}/sequences`,
    {},
    dailySequenceArraySchema, // validasi output
  );
}
